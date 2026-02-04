"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Check from "@mui/icons-material/Check";
import { submitTimeOffRequest } from "@/lib/timeoff";
import { DateRangePicker, HoursSlider } from "@/components";
import type { TimeOffType } from "@/types/database";
import { m3Tokens } from "@/theme";

const TIME_OFF_TYPES: { value: TimeOffType; label: string }[] = [
  { value: "vacation", label: "Vacation" },
  { value: "personal", label: "Personal" },
  { value: "sick", label: "Sick" },
  { value: "bereavement", label: "Bereavement" },
  { value: "unpaid", label: "Unpaid" },
];

export default function NewTimeOffRequestPage() {
  const router = useRouter();

  const [type, setType] = useState<TimeOffType | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paidHours, setPaidHours] = useState(8);
  const [unpaidHours, setUnpaidHours] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = type && startDate && endDate && startDate <= endDate && (paidHours > 0 || unpaidHours > 0);

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const stored = localStorage.getItem("rome_session");
      if (!stored) {
        router.push("/login");
        return;
      }
      const session = JSON.parse(stored);

      const result = await submitTimeOffRequest(session.workerId, {
        type: type!,
        start_date: startDate,
        end_date: endDate,
        paid_hours: paidHours,
        unpaid_hours: unpaidHours,
        comments: comments || undefined,
      });

      if (!result.success) {
        toast.error("Failed to submit request");
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          p: 2,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: `${m3Tokens.colors.success.main}20`,
            mb: 3,
          }}
        >
          <Check sx={{ fontSize: 40, color: m3Tokens.colors.success.main }} />
        </Avatar>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Request Submitted!
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 320, mb: 4 }}>
          Your manager will be notified and you&apos;ll receive an email when it&apos;s approved or denied.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => router.push("/dashboard/time-off")}
          sx={{
            borderColor: m3Tokens.colors.outline.variant,
            color: m3Tokens.colors.onSurface.main,
          }}
        >
          Back to Time Off
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => router.back()} sx={{ color: m3Tokens.colors.onSurface.variant }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          Request Time Off
        </Typography>
      </Box>

      {/* Form */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Type Selection */}
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1.5 }}>
            Type of Absence *
          </Typography>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, newType) => newType && setType(newType)}
            sx={{
              flexWrap: "wrap",
              gap: 1,
              "& .MuiToggleButtonGroup-grouped": {
                border: `1px solid ${m3Tokens.colors.outline.variant} !important`,
                borderRadius: `${m3Tokens.shape.full}px !important`,
                m: 0,
              },
            }}
          >
            {TIME_OFF_TYPES.map((t) => (
              <ToggleButton
                key={t.value}
                value={t.value}
                sx={{
                  px: 2,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                {t.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Date Range */}
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1.5 }}>
            Select Dates *
          </Typography>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </Box>

        {/* Hours */}
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1.5 }}>
            Hours
          </Typography>
          <HoursSlider
            paidHours={paidHours}
            unpaidHours={unpaidHours}
            onPaidHoursChange={setPaidHours}
            onUnpaidHoursChange={setUnpaidHours}
            startDate={startDate}
            endDate={endDate}
          />
        </Box>

        {/* Comments */}
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1.5 }}>
            Reason / Comments
          </Typography>
          <TextField
            multiline
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Optional"
            fullWidth
          />
        </Box>
      </Box>

      {/* Submit Button */}
      <Button
        variant="contained"
        size="large"
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
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
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </Box>
  );
}
