"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import AccessTime from "@mui/icons-material/AccessTime";
import Logout from "@mui/icons-material/Logout";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import ArrowBack from "@mui/icons-material/ArrowBack";
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
import { m3Tokens } from "@/theme";

interface ActionButtonsProps {
  workerName: string;
  isClockedIn: boolean;
  isLoading: boolean;
  loadingAction: "in" | "out" | null;
  onClockIn: () => void;
  onClockOut: () => void;
  onLogProduction: () => void;
  onBack: () => void;
}

export function ActionButtons({
  workerName,
  isClockedIn,
  isLoading,
  loadingAction,
  onClockIn,
  onClockOut,
  onLogProduction,
  onBack,
}: ActionButtonsProps) {
  const actionButtonStyles = {
    py: 3,
    px: 4,
    fontSize: "1.25rem",
    fontWeight: 600,
    borderRadius: m3Tokens.shape.large,
    gap: 2,
    transition: `all ${m3Tokens.motion.duration.short4}ms ${m3Tokens.motion.easing.standard}`,
    "&:active": {
      transform: "scale(0.98)",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: "100%",
        maxWidth: 480,
        mx: "auto",
        px: 2,
      }}
    >
      {/* Welcome Header */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            color: m3Tokens.colors.onSurface.variant,
            letterSpacing: 2,
          }}
        >
          Welcome back
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mt: 0.5,
          }}
        >
          {workerName}
        </Typography>
        <Chip
          icon={
            <FiberManualRecord
              sx={{
                fontSize: 12,
                color: isClockedIn
                  ? m3Tokens.colors.success.main
                  : m3Tokens.colors.outline.main,
                animation: isClockedIn ? "pulse 2s infinite" : "none",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.5 },
                },
              }}
            />
          }
          label={isClockedIn ? "Currently Clocked In" : "Not Clocked In"}
          sx={{
            mt: 2,
            backgroundColor: isClockedIn
              ? `${m3Tokens.colors.success.main}20`
              : m3Tokens.colors.surface.containerHigh,
            color: isClockedIn
              ? m3Tokens.colors.success.main
              : m3Tokens.colors.onSurface.variant,
            fontWeight: 500,
          }}
        />
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        {/* Clock In Button */}
        <Button
          variant="contained"
          onClick={onClockIn}
          disabled={isLoading || isClockedIn}
          startIcon={
            loadingAction === "in" ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <AccessTime />
            )
          }
          sx={{
            ...actionButtonStyles,
            backgroundColor: m3Tokens.colors.success.main,
            color: m3Tokens.colors.success.contrastText,
            "&:hover": {
              backgroundColor: m3Tokens.colors.success.dark,
            },
            "&.Mui-disabled": {
              backgroundColor: m3Tokens.colors.surface.containerHigh,
              color: m3Tokens.colors.outline.main,
            },
          }}
        >
          Clock In
        </Button>

        {/* Clock Out Button */}
        <Button
          variant="contained"
          onClick={onClockOut}
          disabled={isLoading || !isClockedIn}
          startIcon={
            loadingAction === "out" ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Logout />
            )
          }
          sx={{
            ...actionButtonStyles,
            backgroundColor: m3Tokens.colors.error.main,
            color: m3Tokens.colors.error.contrastText,
            "&:hover": {
              backgroundColor: m3Tokens.colors.error.dark,
            },
            "&.Mui-disabled": {
              backgroundColor: m3Tokens.colors.surface.containerHigh,
              color: m3Tokens.colors.outline.main,
            },
          }}
        >
          Clock Out
        </Button>

        {/* Log Production Button */}
        <Button
          variant="contained"
          onClick={onLogProduction}
          disabled={isLoading}
          startIcon={<Inventory2Outlined />}
          sx={{
            ...actionButtonStyles,
            backgroundColor: m3Tokens.colors.primary.main,
            color: m3Tokens.colors.primary.contrastText,
            "&:hover": {
              backgroundColor: m3Tokens.colors.primary.dark,
            },
          }}
        >
          Log Production
        </Button>
      </Box>

      {/* Back Button */}
      <Button
        variant="outlined"
        onClick={onBack}
        disabled={isLoading}
        startIcon={<ArrowBack />}
        sx={{
          mt: 2,
          py: 1.5,
          px: 3,
          borderColor: m3Tokens.colors.outline.variant,
          color: m3Tokens.colors.onSurface.variant,
          "&:hover": {
            borderColor: m3Tokens.colors.outline.main,
            backgroundColor: m3Tokens.colors.surface.containerHigh,
          },
        }}
      >
        Different Worker
      </Button>
    </Box>
  );
}
