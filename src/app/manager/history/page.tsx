"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import { getAllTimeOffRequests, type TimeOffRequestData } from "@/lib/timeoff";
import { m3Tokens } from "@/theme";

const TYPE_LABELS: Record<string, string> = {
  vacation: "Vacation",
  personal: "Personal",
  sick: "Sick",
  bereavement: "Bereavement",
  unpaid: "Unpaid",
};

export default function ManagerHistoryPage() {
  const [requests, setRequests] = useState<TimeOffRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "denied">("all");

  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      const result = await getAllTimeOffRequests();
      if (result.success && result.requests) {
        setRequests(result.requests.filter((r) => r.status !== "pending"));
      }
      setIsLoading(false);
    };

    loadRequests();
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    if (start === end) {
      return formatDate(start);
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "approved", label: "Approved" },
    { value: "denied", label: "Denied" },
  ] as const;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Request History
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Past time off decisions
        </Typography>
      </Box>

      {/* Filter */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
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
              textTransform: "capitalize",
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

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">
            No {filter !== "all" ? filter : ""} requests found
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  {/* Status Icon */}
                  {request.status === "approved" ? (
                    <CheckCircleOutline
                      sx={{ color: m3Tokens.colors.success.main, mt: 0.25 }}
                    />
                  ) : (
                    <CancelOutlined
                      sx={{ color: m3Tokens.colors.error.main, mt: 0.25 }}
                    />
                  )}

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Worker & Type */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <PersonOutlined sx={{ fontSize: 16, color: m3Tokens.colors.onSurface.variant }} />
                      <Typography variant="body2" fontWeight={500}>
                        {request.worker_name || "Unknown"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {TYPE_LABELS[request.type] || request.type}
                      </Typography>
                    </Box>

                    {/* Dates */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <CalendarTodayOutlined sx={{ fontSize: 14, color: m3Tokens.colors.onSurface.variant }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateRange(request.start_date, request.end_date)}
                      </Typography>
                    </Box>

                    {/* Review Info */}
                    <Typography variant="caption" color="text.secondary">
                      {request.status === "approved" ? "Approved" : "Denied"} by{" "}
                      {request.reviewer_name || "Manager"}
                      {request.reviewed_at && <> on {formatDate(request.reviewed_at)}</>}
                    </Typography>

                    {/* Denial Reason */}
                    {request.status === "denied" && request.denial_reason && (
                      <Typography
                        variant="body2"
                        sx={{ color: m3Tokens.colors.error.light, mt: 1, fontStyle: "italic" }}
                      >
                        &quot;{request.denial_reason}&quot;
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
