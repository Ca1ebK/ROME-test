"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import BackspaceOutlined from "@mui/icons-material/BackspaceOutlined";
import { m3Tokens } from "@/theme";

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  isLoading?: boolean;
  error?: string | null;
  label?: string;
}

export function NumericKeypad({
  value,
  onChange,
  onSubmit,
  maxLength = 6,
  isLoading = false,
  error = null,
  label = "Enter Your PIN",
}: NumericKeypadProps) {
  const hasAutoSubmitted = useRef(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleDigitPress = (digit: string) => {
    if (value.length < maxLength && !isLoading) {
      setPressedKey(digit);
      setTimeout(() => setPressedKey(null), 150);
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    if (!isLoading) {
      setPressedKey("backspace");
      setTimeout(() => setPressedKey(null), 150);
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!isLoading) {
      setPressedKey("clear");
      setTimeout(() => setPressedKey(null), 150);
      onChange("");
    }
  };

  // Keyboard input support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitPress(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        handleBackspace();
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (isLoading) return;

      e.preventDefault();
      const pastedText = e.clipboardData?.getData("text") || "";
      const digits = pastedText.replace(/\D/g, "");

      if (digits) {
        const newValue = (value + digits).slice(0, maxLength);
        onChange(newValue);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, [value, isLoading, maxLength, onChange]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (value.length === maxLength && !isLoading && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      const timer = setTimeout(() => {
        onSubmit();
      }, 150);
      return () => clearTimeout(timer);
    }

    if (value.length < maxLength) {
      hasAutoSubmitted.current = false;
    }
  }, [value, maxLength, isLoading, onSubmit]);

  const keypadButtonStyles = {
    minWidth: 88,
    minHeight: 88,
    fontSize: "1.75rem",
    fontWeight: 500,
    borderRadius: m3Tokens.shape.large,
    backgroundColor: m3Tokens.colors.surface.containerHigh,
    color: m3Tokens.colors.onSurface.main,
    transition: `all ${m3Tokens.motion.duration.short4}ms ${m3Tokens.motion.easing.standard}`,
    "&:hover": {
      backgroundColor: m3Tokens.colors.surface.containerHighest,
    },
    "&:active": {
      transform: "scale(0.95)",
    },
    "&.Mui-disabled": {
      backgroundColor: m3Tokens.colors.surface.container,
      color: m3Tokens.colors.outline.main,
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        width: "100%",
        maxWidth: 360,
        mx: "auto",
      }}
    >
      {/* Label */}
      <Typography
        variant="overline"
        sx={{
          color: m3Tokens.colors.onSurface.variant,
          letterSpacing: 2,
        }}
      >
        {label}
      </Typography>

      {/* PIN Display */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          justifyContent: "center",
        }}
      >
        {Array.from({ length: maxLength }).map((_, i) => {
          const isFilled = i < value.length;
          return (
            <Box
              key={i}
              sx={{
                width: 48,
                height: 48,
                borderRadius: m3Tokens.shape.full,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isFilled
                  ? m3Tokens.colors.primary.main
                  : m3Tokens.colors.surface.containerHigh,
                border: `2px solid ${
                  isFilled
                    ? m3Tokens.colors.primary.main
                    : m3Tokens.colors.outline.variant
                }`,
                transition: `all ${m3Tokens.motion.duration.short3}ms ${m3Tokens.motion.easing.emphasizedDecelerate}`,
                transform: isFilled ? "scale(1.1)" : "scale(1)",
              }}
            >
              {isFilled && (
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: m3Tokens.colors.primary.contrastText,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Error Message */}
      {error && (
        <Alert
          severity="error"
          sx={{
            width: "100%",
            animation: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
            "@keyframes shake": {
              "10%, 90%": { transform: "translateX(-1px)" },
              "20%, 80%": { transform: "translateX(2px)" },
              "30%, 50%, 70%": { transform: "translateX(-4px)" },
              "40%, 60%": { transform: "translateX(4px)" },
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Verifying...
          </Typography>
        </Box>
      )}

      {/* Keypad Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          width: "100%",
        }}
      >
        {/* Digits 1-9 */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <Button
            key={digit}
            onClick={() => handleDigitPress(digit.toString())}
            disabled={isLoading || value.length >= maxLength}
            sx={{
              ...keypadButtonStyles,
              ...(pressedKey === digit.toString() && {
                transform: "scale(0.95)",
                backgroundColor: m3Tokens.colors.primary.main,
                color: m3Tokens.colors.primary.contrastText,
              }),
            }}
          >
            {digit}
          </Button>
        ))}

        {/* Clear Button */}
        <Button
          onClick={handleClear}
          disabled={isLoading || value.length === 0}
          sx={{
            ...keypadButtonStyles,
            fontSize: "0.875rem",
            ...(pressedKey === "clear" && {
              transform: "scale(0.95)",
            }),
          }}
        >
          CLR
        </Button>

        {/* Zero */}
        <Button
          onClick={() => handleDigitPress("0")}
          disabled={isLoading || value.length >= maxLength}
          sx={{
            ...keypadButtonStyles,
            ...(pressedKey === "0" && {
              transform: "scale(0.95)",
              backgroundColor: m3Tokens.colors.primary.main,
              color: m3Tokens.colors.primary.contrastText,
            }),
          }}
        >
          0
        </Button>

        {/* Backspace Button */}
        <IconButton
          onClick={handleBackspace}
          disabled={isLoading || value.length === 0}
          sx={{
            ...keypadButtonStyles,
            ...(pressedKey === "backspace" && {
              transform: "scale(0.95)",
            }),
          }}
        >
          <BackspaceOutlined />
        </IconButton>
      </Box>

      {/* Keyboard hint */}
      <Typography variant="caption" color="text.secondary" textAlign="center">
        You can also type or paste with your keyboard
      </Typography>
    </Box>
  );
}
