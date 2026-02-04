"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import ChevronRight from "@mui/icons-material/ChevronRight";
import AccessTime from "@mui/icons-material/AccessTime";
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
import { getWorkerStatus, getWeeklyHours, getPunchHistory, formatDuration, type PunchPair } from "@/lib/supabase";
import { m3Tokens } from "@/theme";

interface Session {
  workerId: string;
  workerName: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [weeklyHours, setWeeklyHours] = useState({ totalHours: 0, dailyHours: {} as Record<string, number> });
  const [recentPunches, setRecentPunches] = useState<PunchPair[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load session
  useEffect(() => {
    const stored = localStorage.getItem("rome_session");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSession({ workerId: parsed.workerId, workerName: parsed.workerName });
    }
  }, []);

  // Load data when session is available
  useEffect(() => {
    if (!session) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const status = await getWorkerStatus(session.workerId);
        setIsClockedIn(status.isClockedIn);
        setClockInTime(status.clockInTime);

        const weekly = await getWeeklyHours(session.workerId);
        setWeeklyHours(weekly);

        const history = await getPunchHistory(session.workerId, 7);
        if (history.success && history.history) {
          setRecentPunches(history.history.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [session]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate current session time
  const getCurrentSessionTime = () => {
    if (!isClockedIn || !clockInTime) return null;
    const start = new Date(clockInTime);
    const ms = currentTime.getTime() - start.getTime();
    return formatDuration(ms);
  };

  // Format time for display
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "--:--";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Days of week
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* This Week Card */}
      <Card>
        <CardContent>
          <Typography
            variant="overline"
            sx={{ color: m3Tokens.colors.onSurface.variant, letterSpacing: 1 }}
          >
            This Week
          </Typography>

          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, my: 2 }}>
            <Typography variant="h3" fontWeight={700}>
              {weeklyHours.totalHours.toFixed(1)}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              hrs
            </Typography>
          </Box>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={Math.min((weeklyHours.totalHours / 40) * 100, 100)}
            sx={{
              height: 12,
              borderRadius: m3Tokens.shape.full,
              backgroundColor: m3Tokens.colors.surface.containerHigh,
              mb: 3,
              "& .MuiLinearProgress-bar": {
                borderRadius: m3Tokens.shape.full,
              },
            }}
          />

          {/* Daily breakdown */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            {weekDays.map((day) => (
              <Box key={day} sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  {day}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {weeklyHours.dailyHours[day]?.toFixed(1) || "--"}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Today Card */}
      <Card>
        <CardContent>
          <Typography
            variant="overline"
            sx={{ color: m3Tokens.colors.onSurface.variant, letterSpacing: 1 }}
          >
            Today
          </Typography>

          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* Clock In Status */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <FiberManualRecord
                sx={{
                  fontSize: 12,
                  color: isClockedIn ? m3Tokens.colors.success.main : m3Tokens.colors.outline.main,
                  animation: isClockedIn ? "pulse 2s infinite" : "none",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                  },
                }}
              />
              <Typography variant="body1">
                {isClockedIn ? "Clocked In" : "Not clocked in"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                {isClockedIn ? formatTime(clockInTime) : "--:--"}
              </Typography>
            </Box>

            {/* Clock Out Status */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <FiberManualRecord
                sx={{ fontSize: 12, color: m3Tokens.colors.outline.main }}
              />
              <Typography variant="body1" color="text.secondary">
                {isClockedIn ? "Not yet" : "Clocked Out"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                --:--
              </Typography>
            </Box>

            {/* Current session */}
            {isClockedIn && (
              <Box
                sx={{
                  pt: 2,
                  mt: 1,
                  borderTop: `1px solid ${m3Tokens.colors.outline.variant}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AccessTime sx={{ fontSize: 18, color: m3Tokens.colors.primary.main }} />
                <Typography variant="body2" color="text.secondary">
                  Currently working:
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ ml: "auto", color: m3Tokens.colors.primary.main, fontWeight: 600 }}
                >
                  {getCurrentSessionTime()}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Recent Punches Card */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography
              variant="overline"
              sx={{ color: m3Tokens.colors.onSurface.variant, letterSpacing: 1 }}
            >
              Recent Punches
            </Typography>
            <Button
              variant="text"
              size="small"
              endIcon={<ChevronRight />}
              onClick={() => router.push("/dashboard/history")}
              sx={{ color: m3Tokens.colors.primary.main }}
            >
              See All
            </Button>
          </Box>

          {recentPunches.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
              No recent punches
            </Typography>
          ) : (
            <List disablePadding>
              {recentPunches.map((punch, index) => (
                <ListItem
                  key={punch.date}
                  disablePadding
                  sx={{
                    py: 1.5,
                    borderBottom:
                      index < recentPunches.length - 1
                        ? `1px solid ${m3Tokens.colors.outline.variant}`
                        : "none",
                  }}
                >
                  <ListItemText
                    primary={formatDate(punch.date)}
                    secondary={
                      <>
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
                        {punch.clockOut && (
                          <>
                            {" → "}
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
                          </>
                        )}
                      </>
                    }
                    primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {punch.totalMs > 0 ? formatDuration(punch.totalMs) : "--"}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Quick action - Go to kiosk */}
      <Box sx={{ textAlign: "center", pt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Need to clock in or out?{" "}
          <Link
            href="/kiosk"
            sx={{
              color: m3Tokens.colors.primary.main,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Use the kiosk →
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
