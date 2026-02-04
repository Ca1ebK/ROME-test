"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import Refresh from "@mui/icons-material/Refresh";
import { m3Tokens } from "@/theme";

interface ErrorRetryProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorRetry({
  message,
  onRetry,
  isRetrying = false,
}: ErrorRetryProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        p: 4,
        maxWidth: 400,
        mx: "auto",
      }}
    >
      {/* Error Icon */}
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: `${m3Tokens.colors.error.main}20`,
        }}
      >
        <WarningAmberOutlined
          sx={{ fontSize: 40, color: m3Tokens.colors.error.main }}
        />
      </Avatar>

      {/* Error Message */}
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </Box>

      {/* Retry Button */}
      <Button
        variant="contained"
        onClick={onRetry}
        disabled={isRetrying}
        startIcon={
          isRetrying ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Refresh />
          )
        }
        sx={{
          py: 1.5,
          px: 4,
          fontSize: "1.125rem",
          fontWeight: 600,
          backgroundColor: m3Tokens.colors.primary.main,
          "&:hover": {
            backgroundColor: m3Tokens.colors.primary.dark,
          },
        }}
      >
        {isRetrying ? "Retrying..." : "Try Again"}
      </Button>

      {/* Help text */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: "center", mt: 2 }}
      >
        If this problem persists, please contact a supervisor.
      </Typography>
    </Box>
  );
}
