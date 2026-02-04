"use client";

import { useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Slider from "@mui/material/Slider";
import Remove from "@mui/icons-material/Remove";
import Add from "@mui/icons-material/Add";
import { m3Tokens } from "@/theme";

interface HoursSliderProps {
  paidHours: number;
  unpaidHours: number;
  onPaidHoursChange: (hours: number) => void;
  onUnpaidHoursChange: (hours: number) => void;
  startDate?: string;
  endDate?: string;
}

function calculateWorkDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;

  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(count, 1);
}

export function HoursSlider({
  paidHours,
  unpaidHours,
  onPaidHoursChange,
  onUnpaidHoursChange,
  startDate,
  endDate,
}: HoursSliderProps) {
  const totalHours = paidHours + unpaidHours;

  const suggestedTotal = useMemo(() => {
    if (!startDate || !endDate) return 8;
    const workDays = calculateWorkDays(startDate, endDate);
    return workDays * 8;
  }, [startDate, endDate]);

  const handleSliderChange = useCallback(
    (_: Event, value: number | number[]) => {
      const newPaid = Math.round((value as number) * 2) / 2;
      const newUnpaid = Math.max(0, totalHours - newPaid);
      onPaidHoursChange(newPaid);
      onUnpaidHoursChange(Math.round(newUnpaid * 2) / 2);
    },
    [totalHours, onPaidHoursChange, onUnpaidHoursChange]
  );

  const handlePaidIncrement = (delta: number) => {
    const newPaid = Math.max(0, paidHours + delta);
    onPaidHoursChange(newPaid);
  };

  const handleUnpaidIncrement = (delta: number) => {
    const newUnpaid = Math.max(0, unpaidHours + delta);
    onUnpaidHoursChange(newUnpaid);
  };

  const handlePaidInput = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onPaidHoursChange(num);
    }
  };

  const handleUnpaidInput = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onUnpaidHoursChange(num);
    }
  };

  const setSuggestedHours = () => {
    onPaidHoursChange(suggestedTotal);
    onUnpaidHoursChange(0);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Total Hours Display */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Total Hours
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h5" fontWeight={700}>
            {totalHours}h
          </Typography>
          {startDate && endDate && totalHours !== suggestedTotal && (
            <Button
              variant="text"
              size="small"
              onClick={setSuggestedHours}
              sx={{ color: m3Tokens.colors.primary.main, fontSize: "0.75rem" }}
            >
              Use {suggestedTotal}h
            </Button>
          )}
        </Box>
      </Box>

      {/* Visual Slider Bar */}
      <Box sx={{ position: "relative" }}>
        {/* Background Bar */}
        <Box
          sx={{
            height: 40,
            borderRadius: m3Tokens.shape.medium,
            overflow: "hidden",
            display: "flex",
            backgroundColor: m3Tokens.colors.surface.containerHigh,
          }}
        >
          {/* Paid Section */}
          <Box
            sx={{
              backgroundColor: m3Tokens.colors.success.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: `width ${m3Tokens.motion.duration.short4}ms ${m3Tokens.motion.easing.standard}`,
              width: totalHours > 0 ? `${(paidHours / totalHours) * 100}%` : "50%",
            }}
          >
            {paidHours > 0 && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: m3Tokens.colors.success.contrastText,
                  px: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Paid {paidHours}h
              </Typography>
            )}
          </Box>
          {/* Unpaid Section */}
          <Box
            sx={{
              backgroundColor: m3Tokens.colors.surface.containerHighest,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: `width ${m3Tokens.motion.duration.short4}ms ${m3Tokens.motion.easing.standard}`,
              flex: 1,
            }}
          >
            {unpaidHours > 0 && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: m3Tokens.colors.onSurface.variant,
                  px: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Unpaid {unpaidHours}h
              </Typography>
            )}
          </Box>
        </Box>

        {/* MUI Slider Overlay */}
        {totalHours > 0 && (
          <Slider
            value={paidHours}
            min={0}
            max={totalHours}
            step={0.5}
            onChange={handleSliderChange}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 40,
              "& .MuiSlider-thumb": {
                width: 24,
                height: 24,
                backgroundColor: m3Tokens.colors.onSurface.main,
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                },
              },
              "& .MuiSlider-track": {
                display: "none",
              },
              "& .MuiSlider-rail": {
                display: "none",
              },
            }}
          />
        )}
      </Box>

      {/* Numeric Inputs */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
        {/* Paid Hours Input */}
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
            Paid Hours
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => handlePaidIncrement(-0.5)}
              disabled={paidHours <= 0}
              sx={{
                backgroundColor: m3Tokens.colors.surface.containerHigh,
                "&:hover": { backgroundColor: m3Tokens.colors.surface.containerHighest },
              }}
            >
              <Remove fontSize="small" />
            </IconButton>
            <TextField
              type="number"
              value={paidHours}
              onChange={(e) => handlePaidInput(e.target.value)}
              inputProps={{ min: 0, step: 0.5, style: { textAlign: "center" } }}
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  "& input": {
                    fontWeight: 600,
                    color: m3Tokens.colors.success.main,
                  },
                },
              }}
            />
            <IconButton
              onClick={() => handlePaidIncrement(0.5)}
              sx={{
                backgroundColor: m3Tokens.colors.surface.containerHigh,
                "&:hover": { backgroundColor: m3Tokens.colors.surface.containerHighest },
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Unpaid Hours Input */}
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
            Unpaid Hours
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => handleUnpaidIncrement(-0.5)}
              disabled={unpaidHours <= 0}
              sx={{
                backgroundColor: m3Tokens.colors.surface.containerHigh,
                "&:hover": { backgroundColor: m3Tokens.colors.surface.containerHighest },
              }}
            >
              <Remove fontSize="small" />
            </IconButton>
            <TextField
              type="number"
              value={unpaidHours}
              onChange={(e) => handleUnpaidInput(e.target.value)}
              inputProps={{ min: 0, step: 0.5, style: { textAlign: "center" } }}
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  "& input": {
                    fontWeight: 600,
                  },
                },
              }}
            />
            <IconButton
              onClick={() => handleUnpaidIncrement(0.5)}
              sx={{
                backgroundColor: m3Tokens.colors.surface.containerHigh,
                "&:hover": { backgroundColor: m3Tokens.colors.surface.containerHighest },
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Quick Presets */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {[4, 8, 16, 24, 40].map((hours) => (
          <Chip
            key={hours}
            label={`${hours}h`}
            onClick={() => {
              onPaidHoursChange(hours);
              onUnpaidHoursChange(0);
            }}
            sx={{
              backgroundColor:
                totalHours === hours && unpaidHours === 0
                  ? m3Tokens.colors.primary.main
                  : m3Tokens.colors.surface.containerHigh,
              color:
                totalHours === hours && unpaidHours === 0
                  ? m3Tokens.colors.primary.contrastText
                  : m3Tokens.colors.onSurface.variant,
              fontWeight: 500,
              "&:hover": {
                backgroundColor:
                  totalHours === hours && unpaidHours === 0
                    ? m3Tokens.colors.primary.dark
                    : m3Tokens.colors.surface.containerHighest,
              },
            }}
          />
        ))}
        {startDate && endDate && (
          <Chip
            label={`Auto (${suggestedTotal}h)`}
            onClick={setSuggestedHours}
            sx={{
              backgroundColor: m3Tokens.colors.surface.containerHigh,
              color: m3Tokens.colors.primary.main,
              fontWeight: 500,
              "&:hover": {
                backgroundColor: m3Tokens.colors.surface.containerHighest,
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
}
