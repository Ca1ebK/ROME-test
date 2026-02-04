"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Check from "@mui/icons-material/Check";
import { m3Tokens } from "@/theme";

interface AddWorkerProps {
  isLoading: boolean;
  onSubmit: (pin: string, name: string, role: string) => void;
  onBack: () => void;
}

export function AddWorker({ isLoading, onSubmit, onBack }: AddWorkerProps) {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("worker");
  const [error, setError] = useState<string | null>(null);

  const handlePinChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setPin(digits);
    setError(null);
  };

  const handleSubmit = () => {
    if (pin.length !== 6) {
      setError("PIN must be exactly 6 digits");
      return;
    }
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    onSubmit(pin, name.trim(), role);
  };

  const isValid = pin.length === 6 && name.trim().length > 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 400,
        mx: "auto",
        px: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
            bgcolor: `${m3Tokens.colors.primary.main}20`,
          }}
        >
          <PersonAddOutlined
            sx={{ fontSize: 32, color: m3Tokens.colors.primary.main }}
          />
        </Avatar>
        <Typography variant="h5" fontWeight={600}>
          Add New Worker
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Create a new worker account with a 6-digit PIN
        </Typography>
      </Box>

      {/* Form */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        {/* Name Input */}
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="Enter worker's full name"
          disabled={isLoading}
          fullWidth
          variant="outlined"
        />

        {/* PIN Input */}
        <Box>
          <TextField
            label="6-Digit PIN"
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            placeholder="000000"
            disabled={isLoading}
            fullWidth
            variant="outlined"
            inputProps={{
              inputMode: "numeric",
              style: {
                fontFamily: "monospace",
                letterSpacing: "0.5em",
                textAlign: "center",
                fontSize: "1.25rem",
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            This PIN will be used to clock in/out
          </Typography>
        </Box>

        {/* Role Selection */}
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 500 }}
          >
            Role
          </Typography>
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(_, newRole) => newRole && setRole(newRole)}
            disabled={isLoading}
            fullWidth
            sx={{
              "& .MuiToggleButton-root": {
                py: 1.5,
                fontSize: "1rem",
              },
            }}
          >
            <ToggleButton value="worker">Worker</ToggleButton>
            <ToggleButton value="supervisor">Supervisor</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Error Message */}
        {error && <Alert severity="error">{error}</Alert>}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : <Check />
          }
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            backgroundColor: m3Tokens.colors.success.main,
            "&:hover": {
              backgroundColor: m3Tokens.colors.success.dark,
            },
            "&.Mui-disabled": {
              backgroundColor: m3Tokens.colors.surface.containerHigh,
              color: m3Tokens.colors.outline.main,
            },
          }}
        >
          {isLoading ? "Creating..." : "Create Worker"}
        </Button>

        <Button
          variant="outlined"
          onClick={onBack}
          disabled={isLoading}
          startIcon={<ArrowBack />}
          sx={{
            py: 1.5,
            borderColor: m3Tokens.colors.outline.variant,
            color: m3Tokens.colors.onSurface.variant,
            "&:hover": {
              borderColor: m3Tokens.colors.outline.main,
              backgroundColor: m3Tokens.colors.surface.containerHigh,
            },
          }}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
}
