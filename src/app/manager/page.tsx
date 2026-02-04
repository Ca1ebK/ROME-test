"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import AccessTime from "@mui/icons-material/AccessTime";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import { getAllPendingRequests, approveRequest, denyRequest, type TimeOffRequestData } from "@/lib/timeoff";
import { m3Tokens } from "@/theme";

const TYPE_LABELS: Record<string, string> = {
  vacation: "Vacation",
  personal: "Personal",
  sick: "Sick",
  bereavement: "Bereavement",
  unpaid: "Unpaid",
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  vacation: { bg: "#3B82F620", text: "#60A5FA" },
  personal: { bg: "#A855F720", text: "#C084FC" },
  sick: { bg: "#EF444420", text: "#F87171" },
  bereavement: { bg: "#6B728020", text: "#9CA3AF" },
  unpaid: { bg: "#F59E0B20", text: "#FBBF24" },
};

export default function ManagerPendingPage() {
  const [requests, setRequests] = useState<TimeOffRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showDenyModal, setShowDenyModal] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState("");

  const getManagerId = () => {
    const stored = localStorage.getItem("rome_session");
    if (stored) {
      return JSON.parse(stored).workerId;
    }
    return null;
  };

  const loadRequests = async () => {
    setIsLoading(true);
    const result = await getAllPendingRequests();
    if (result.success && result.requests) {
      setRequests(result.requests);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    const managerId = getManagerId();
    if (!managerId) return;

    setProcessingId(requestId);
    const result = await approveRequest(requestId, managerId);

    if (result.success) {
      toast.success("Request approved!");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } else {
      toast.error("Failed to approve request");
    }

    setProcessingId(null);
  };

  const handleDeny = async (requestId: string) => {
    const managerId = getManagerId();
    if (!managerId) return;

    setProcessingId(requestId);
    const result = await denyRequest(requestId, managerId, denyReason);

    if (result.success) {
      toast.success("Request denied");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setShowDenyModal(null);
      setDenyReason("");
    } else {
      toast.error("Failed to deny request");
    }

    setProcessingId(null);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

    if (start === end) {
      return startDate.toLocaleDateString("en-US", { ...opts, weekday: "short" });
    }

    return `${startDate.toLocaleDateString("en-US", opts)} - ${endDate.toLocaleDateString("en-US", opts)}`;
  };

  const getDayCount = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    }
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    }
    return "Just now";
  };

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
          Pending Requests
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {requests.length} request{requests.length !== 1 ? "s" : ""} awaiting approval
        </Typography>
      </Box>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: `${m3Tokens.colors.success.main}20`,
              mx: "auto",
              mb: 2,
            }}
          >
            <Check sx={{ fontSize: 32, color: m3Tokens.colors.success.main }} />
          </Avatar>
          <Typography variant="h6" color="text.secondary">
            All caught up!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No pending requests
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {requests.map((request) => {
            const typeColor = TYPE_COLORS[request.type] || TYPE_COLORS.unpaid;
            return (
              <Card key={request.id}>
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: m3Tokens.colors.surface.containerHigh }}>
                        <PersonOutlined sx={{ color: m3Tokens.colors.onSurface.variant }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {request.worker_name || "Unknown Worker"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTime sx={{ fontSize: 12 }} />
                          {getTimeAgo(request.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={TYPE_LABELS[request.type] || request.type}
                      size="small"
                      sx={{
                        bgcolor: typeColor.bg,
                        color: typeColor.text,
                        fontWeight: 500,
                      }}
                    />
                  </Box>

                  {/* Details */}
                  <Card
                    variant="outlined"
                    sx={{
                      mb: 2,
                      bgcolor: m3Tokens.colors.surface.containerLow,
                      borderColor: m3Tokens.colors.outline.variant,
                    }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <CalendarTodayOutlined sx={{ fontSize: 18, color: m3Tokens.colors.primary.main }} />
                        <Typography variant="body2" fontWeight={500}>
                          {formatDateRange(request.start_date, request.end_date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({getDayCount(request.start_date, request.end_date)})
                        </Typography>
                      </Box>

                      {request.paid_hours > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Paid: {request.paid_hours}h
                        </Typography>
                      )}
                      {request.unpaid_hours > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Unpaid: {request.unpaid_hours}h
                        </Typography>
                      )}

                      {request.comments && (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mt: 1 }}>
                          &quot;{request.comments}&quot;
                        </Typography>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={processingId === request.id ? <CircularProgress size={18} color="inherit" /> : <Check />}
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      sx={{
                        bgcolor: m3Tokens.colors.success.main,
                        "&:hover": { bgcolor: m3Tokens.colors.success.dark },
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Close />}
                      onClick={() => setShowDenyModal(request.id)}
                      disabled={processingId === request.id}
                      sx={{
                        borderColor: m3Tokens.colors.outline.variant,
                        color: m3Tokens.colors.onSurface.main,
                      }}
                    >
                      Deny
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Deny Dialog */}
      <Dialog open={!!showDenyModal} onClose={() => setShowDenyModal(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Deny Request?</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Reason (optional)"
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            placeholder="e.g., Coverage unavailable"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowDenyModal(null);
              setDenyReason("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => showDenyModal && handleDeny(showDenyModal)}
            disabled={processingId !== null}
          >
            Deny Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
