"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Add from "@mui/icons-material/Add";
import AccessTime from "@mui/icons-material/AccessTime";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import { getMyTimeOffRequests, type TimeOffRequestData } from "@/lib/timeoff";
import type { TimeOffType, RequestStatus } from "@/types/database";
import { m3Tokens } from "@/theme";

const TYPE_LABELS: Record<TimeOffType, string> = {
  vacation: "Vacation",
  personal: "Personal",
  sick: "Sick",
  bereavement: "Bereavement",
  unpaid: "Unpaid",
};

const STATUS_CONFIG: Record<RequestStatus, { icon: typeof AccessTime; color: string; label: string }> = {
  pending: { icon: AccessTime, color: m3Tokens.colors.warning.main, label: "Pending" },
  approved: { icon: CheckCircleOutline, color: m3Tokens.colors.success.main, label: "Approved" },
  denied: { icon: CancelOutlined, color: m3Tokens.colors.error.main, label: "Denied" },
};

export default function TimeOffPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<TimeOffRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      const stored = localStorage.getItem("rome_session");
      if (!stored) {
        router.push("/login");
        return;
      }
      const session = JSON.parse(stored);

      const result = await getMyTimeOffRequests(session.workerId);
      if (result.success && result.requests) {
        setRequests(result.requests);
      }
      setIsLoading(false);
    };

    loadRequests();
  }, [router]);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (start === end) {
      return `${startStr}, ${startDate.getFullYear()}`;
    }

    const endStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${startStr}-${endStr}, ${endDate.getFullYear()}`;
  };

  const getDayCount = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const pastRequests = requests.filter((r) => r.status !== "pending");

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Request Button */}
      <Button
        variant="contained"
        size="large"
        startIcon={<Add />}
        onClick={() => router.push("/dashboard/time-off/new")}
        sx={{
          py: 1.5,
          fontSize: "1rem",
          fontWeight: 600,
          backgroundColor: m3Tokens.colors.primary.main,
          "&:hover": {
            backgroundColor: m3Tokens.colors.primary.dark,
          },
        }}
      >
        Request Time Off
      </Button>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Box>
          <Typography
            variant="overline"
            sx={{ color: m3Tokens.colors.onSurface.variant, letterSpacing: 1, mb: 1.5, display: "block" }}
          >
            Pending
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {pendingRequests.map((request) => {
              const StatusIcon = STATUS_CONFIG[request.status].icon;
              return (
                <Card key={request.id}>
                  <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                      <StatusIcon sx={{ color: STATUS_CONFIG[request.status].color, mt: 0.25 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {TYPE_LABELS[request.type]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {formatDateRange(request.start_date, request.end_date)} ({getDayCount(request.start_date, request.end_date)})
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          Submitted {new Date(request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: m3Tokens.colors.warning.main, display: "block", mt: 0.5 }}>
                          Awaiting manager approval
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Past Requests */}
      <Box>
        <Typography
          variant="overline"
          sx={{ color: m3Tokens.colors.onSurface.variant, letterSpacing: 1, mb: 1.5, display: "block" }}
        >
          Past Requests
        </Typography>
        {pastRequests.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            No past requests
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {pastRequests.map((request) => {
              const StatusIcon = STATUS_CONFIG[request.status].icon;
              return (
                <Card key={request.id}>
                  <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                      <StatusIcon sx={{ color: STATUS_CONFIG[request.status].color, mt: 0.25 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {TYPE_LABELS[request.type]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {formatDateRange(request.start_date, request.end_date)} ({getDayCount(request.start_date, request.end_date)})
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: STATUS_CONFIG[request.status].color, display: "block", mt: 0.5 }}
                        >
                          {request.status === "approved" && `Approved${request.reviewer_name ? ` by ${request.reviewer_name}` : ""}`}
                          {request.status === "denied" && (request.denial_reason || "Denied")}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
