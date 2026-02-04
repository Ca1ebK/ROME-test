"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBack from "@mui/icons-material/ArrowBack";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import { getPunchHistory, formatDuration, type PunchPair } from "@/lib/supabase";
import { m3Tokens } from "@/theme";

export default function PunchHistoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [punches, setPunches] = useState<PunchPair[]>([]);
  const [filter, setFilter] = useState<"week" | "month" | "all">("week");

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);

      const stored = localStorage.getItem("rome_session");
      if (!stored) {
        router.push("/login");
        return;
      }

      const session = JSON.parse(stored);
      const days = filter === "week" ? 7 : filter === "month" ? 30 : 90;

      const result = await getPunchHistory(session.workerId, days);

      if (result.success && result.history) {
        setPunches(result.history);
      }

      setIsLoading(false);
    };

    loadHistory();
  }, [filter, router]);

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "--:--";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const groupByMonth = (punches: PunchPair[]) => {
    const groups: Record<string, PunchPair[]> = {};

    for (const punch of punches) {
      const date = new Date(punch.date);
      const monthKey = date.toLocaleDateString("en-US", { year: "numeric", month: "long" });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(punch);
    }

    return groups;
  };

  const grouped = groupByMonth(punches);
  const totalMs = punches.reduce((sum, p) => sum + p.totalMs, 0);

  const filterOptions = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "all", label: "All Time" },
  ] as const;

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => router.back()} sx={{ color: m3Tokens.colors.onSurface.variant }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Punch History
          </Typography>
        </Box>

        <Button
          variant="text"
          size="small"
          startIcon={<FileDownloadOutlined />}
          sx={{ color: m3Tokens.colors.primary.main }}
        >
          Export
        </Button>
      </Box>

      {/* Filter */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {filterOptions.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            onClick={() => setFilter(option.value)}
            sx={{
              backgroundColor:
                filter === option.value
                  ? m3Tokens.colors.primary.main
                  : m3Tokens.colors.surface.containerHigh,
              color:
                filter === option.value
                  ? m3Tokens.colors.primary.contrastText
                  : m3Tokens.colors.onSurface.variant,
              fontWeight: 500,
              "&:hover": {
                backgroundColor:
                  filter === option.value
                    ? m3Tokens.colors.primary.dark
                    : m3Tokens.colors.surface.containerHighest,
              },
            }}
          />
        ))}
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 192 }}>
          <CircularProgress />
        </Box>
      ) : punches.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No punch history found</Typography>
        </Box>
      ) : (
        <>
          {Object.entries(grouped).map(([month, monthPunches]) => (
            <Box key={month}>
              <Typography
                variant="overline"
                sx={{
                  color: m3Tokens.colors.onSurface.variant,
                  letterSpacing: 1,
                  mb: 1.5,
                  display: "block",
                }}
              >
                {month}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {monthPunches.map((punch) => {
                  const date = new Date(punch.date);
                  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                  const dayNum = date.getDate();

                  return (
                    <Card key={punch.date}>
                      <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box sx={{ textAlign: "center", minWidth: 40 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                                {dayName}
                              </Typography>
                              <Typography variant="h6" fontWeight={700}>
                                {dayNum}
                              </Typography>
                            </Box>

                            <Box sx={{ borderLeft: `1px solid ${m3Tokens.colors.outline.variant}`, pl: 2 }}>
                              <Typography variant="body2">
                                <Chip
                                  label="IN"
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.625rem",
                                    mr: 0.5,
                                    bgcolor: `${m3Tokens.colors.success.main}20`,
                                    color: m3Tokens.colors.success.main,
                                  }}
                                />
                                {formatTime(punch.clockIn)}
                              </Typography>
                              <Typography variant="body2">
                                <Chip
                                  label="OUT"
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.625rem",
                                    mr: 0.5,
                                    bgcolor: `${m3Tokens.colors.error.main}20`,
                                    color: m3Tokens.colors.error.main,
                                  }}
                                />
                                {formatTime(punch.clockOut)}
                              </Typography>
                            </Box>
                          </Box>

                          <Typography variant="subtitle2" fontWeight={600}>
                            {punch.totalMs > 0 ? formatDuration(punch.totalMs) : "--"}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          ))}

          {/* Total */}
          <Card
            sx={{
              mt: 2,
              border: `1px solid ${m3Tokens.colors.primary.main}30`,
            }}
          >
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  {filter === "week" ? "Week" : filter === "month" ? "Month" : "Period"} Total
                </Typography>
                <Typography variant="h6" sx={{ color: m3Tokens.colors.primary.main, fontWeight: 700 }}>
                  {formatDuration(totalMs)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
