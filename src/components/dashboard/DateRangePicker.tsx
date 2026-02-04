"use client";

import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import { m3Tokens } from "@/theme";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return date >= start && date <= end;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const start = parseDate(startDate);
    return start || new Date();
  });
  const [selectingEnd, setSelectingEnd] = useState(false);

  const today = useMemo(() => new Date(), []);
  const startParsed = parseDate(startDate);
  const endParsed = parseDate(endDate);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    const dateStr = formatDateString(date);

    if (!selectingEnd || !startParsed) {
      onStartDateChange(dateStr);
      onEndDateChange(dateStr);
      setSelectingEnd(true);
    } else {
      if (date < startParsed) {
        onStartDateChange(dateStr);
        onEndDateChange(formatDateString(startParsed));
      } else {
        onEndDateChange(dateStr);
      }
      setSelectingEnd(false);
    }
  };

  const handleQuickSelect = (type: "today" | "tomorrow" | "nextWeek") => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (type) {
      case "today":
        start = now;
        end = now;
        break;
      case "tomorrow":
        start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        end = start;
        break;
      case "nextWeek":
        const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
        start = new Date(now.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
        end = new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000);
        break;
    }

    onStartDateChange(formatDateString(start));
    onEndDateChange(formatDateString(end));
    setCurrentMonth(start);
    setSelectingEnd(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = parseDate(dateStr);
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Quick Selection Buttons */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Chip
          label="Today"
          onClick={() => handleQuickSelect("today")}
          variant="filled"
          sx={{
            backgroundColor: m3Tokens.colors.surface.containerHigh,
            "&:hover": { backgroundColor: m3Tokens.colors.surface.containerHighest },
          }}
        />
        <Chip
          label="Tomorrow"
          onClick={() => handleQuickSelect("tomorrow")}
          variant="filled"
          sx={{
            backgroundColor: m3Tokens.colors.surface.containerHigh,
            "&:hover": { backgroundColor: m3Tokens.colors.surface.containerHighest },
          }}
        />
        <Chip
          label="Next Week"
          onClick={() => handleQuickSelect("nextWeek")}
          variant="filled"
          sx={{
            backgroundColor: m3Tokens.colors.surface.containerHigh,
            "&:hover": { backgroundColor: m3Tokens.colors.surface.containerHighest },
          }}
        />
      </Box>

      {/* Date Display / Toggle */}
      <Card
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          cursor: "pointer",
          border: `1px solid ${isOpen ? m3Tokens.colors.primary.main : m3Tokens.colors.outline.variant}`,
          "&:hover": { borderColor: m3Tokens.colors.primary.main },
          transition: `border-color ${m3Tokens.motion.duration.short4}ms ${m3Tokens.motion.easing.standard}`,
        }}
      >
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, "&:last-child": { pb: 2 } }}>
          <CalendarTodayOutlined sx={{ color: m3Tokens.colors.primary.main }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                {formatDisplayDate(startDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">→</Typography>
              <Typography variant="subtitle1" fontWeight={500}>
                {formatDisplayDate(endDate)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {selectingEnd ? "Select end date" : "Click to select dates"}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Collapse in={isOpen}>
        <Card sx={{ mt: 1 }}>
          <CardContent>
            {/* Month Navigation */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <IconButton onClick={handlePrevMonth} size="small">
                <ChevronLeft />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={600}>
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Typography>
              <IconButton onClick={handleNextMonth} size="small">
                <ChevronRight />
              </IconButton>
            </Box>

            {/* Day Headers */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 1 }}>
              {DAYS.map((day) => (
                <Box
                  key={day}
                  sx={{
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {day}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Calendar Days */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <Box key={`empty-${index}`} sx={{ height: 40 }} />;
                }

                const isToday = isSameDay(date, today);
                const isStart = startParsed && isSameDay(date, startParsed);
                const isEnd = endParsed && isSameDay(date, endParsed);
                const inRange = isInRange(date, startParsed, endParsed);
                const isPast = date < today && !isSameDay(date, today);

                return (
                  <Button
                    key={formatDateString(date)}
                    onClick={() => handleDayClick(date)}
                    disabled={isPast}
                    sx={{
                      minWidth: 0,
                      height: 40,
                      borderRadius: m3Tokens.shape.small,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: isPast
                        ? m3Tokens.colors.outline.main
                        : isStart || isEnd
                        ? m3Tokens.colors.primary.contrastText
                        : m3Tokens.colors.onSurface.main,
                      backgroundColor: isStart || isEnd
                        ? m3Tokens.colors.primary.main
                        : inRange
                        ? `${m3Tokens.colors.primary.main}20`
                        : "transparent",
                      border: isToday && !isStart && !isEnd
                        ? `1px solid ${m3Tokens.colors.primary.main}`
                        : "none",
                      "&:hover": {
                        backgroundColor: isStart || isEnd
                          ? m3Tokens.colors.primary.dark
                          : m3Tokens.colors.surface.containerHigh,
                      },
                      "&.Mui-disabled": {
                        color: m3Tokens.colors.outline.main,
                      },
                    }}
                  >
                    {date.getDate()}
                  </Button>
                );
              })}
            </Box>

            {/* Legend */}
            <Box sx={{ display: "flex", gap: 3, mt: 3, pt: 2, borderTop: `1px solid ${m3Tokens.colors.outline.variant}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: m3Tokens.colors.primary.main }} />
                <Typography variant="caption" color="text.secondary">Selected</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: `${m3Tokens.colors.primary.main}20` }} />
                <Typography variant="caption" color="text.secondary">In Range</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 1, border: `1px solid ${m3Tokens.colors.primary.main}` }} />
                <Typography variant="caption" color="text.secondary">Today</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
}
