"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Remove from "@mui/icons-material/Remove";
import Add from "@mui/icons-material/Add";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Send from "@mui/icons-material/Send";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import ViewInArOutlined from "@mui/icons-material/ViewInArOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import { m3Tokens } from "@/theme";

// Hardcoded task list for Scholastic warehouse
const TASKS = [
  { id: "box-packing", name: "Box Packing", Icon: Inventory2Outlined },
  { id: "table-sorting", name: "Table Sorting", Icon: GridViewOutlined },
  { id: "pallet-loading", name: "Pallet Loading", Icon: ViewInArOutlined },
  { id: "shipping-receiving", name: "Shipping/Receiving", Icon: LocalShippingOutlined },
] as const;

type TaskId = (typeof TASKS)[number]["id"];
type TaskQuantities = Record<TaskId, number>;

interface ProductionLogProps {
  workerName: string;
  isLoading: boolean;
  onSubmit: (entries: { taskName: string; quantity: number }[]) => void;
  onBack: () => void;
}

export function ProductionLog({
  workerName,
  isLoading,
  onSubmit,
  onBack,
}: ProductionLogProps) {
  const [quantities, setQuantities] = useState<TaskQuantities>({
    "box-packing": 0,
    "table-sorting": 0,
    "pallet-loading": 0,
    "shipping-receiving": 0,
  });

  const updateQuantity = (taskId: TaskId, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [taskId]: Math.max(0, prev[taskId] + delta),
    }));
  };

  const handleSubmit = () => {
    const entries = TASKS.map((task) => ({
      taskName: task.name,
      quantity: quantities[task.id],
    })).filter((entry) => entry.quantity > 0);

    onSubmit(entries);
  };

  const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const hasEntries = totalItems > 0;

  const counterButtonStyles = {
    width: 48,
    height: 48,
    borderRadius: m3Tokens.shape.medium,
    transition: `all ${m3Tokens.motion.duration.short4}ms ${m3Tokens.motion.easing.standard}`,
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 480,
        mx: "auto",
        px: 2,
        pb: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="overline"
          sx={{ color: m3Tokens.colors.onSurface.variant, letterSpacing: 2 }}
        >
          Production Log
        </Typography>
        <Typography variant="h5" fontWeight={600} sx={{ mt: 0.5 }}>
          {workerName}
        </Typography>
      </Box>

      {/* Task List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
        {TASKS.map((task) => {
          const { Icon } = task;
          const quantity = quantities[task.id];

          return (
            <Card
              key={task.id}
              sx={{
                backgroundColor: m3Tokens.colors.surface.container,
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 2,
                  "&:last-child": { pb: 2 },
                }}
              >
                {/* Task Info */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: m3Tokens.shape.medium,
                      backgroundColor: m3Tokens.colors.surface.containerHigh,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon sx={{ color: m3Tokens.colors.primary.main }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {task.name}
                  </Typography>
                </Box>

                {/* Counter Controls */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    onClick={() => updateQuantity(task.id, -1)}
                    disabled={quantity === 0 || isLoading}
                    sx={{
                      ...counterButtonStyles,
                      backgroundColor: m3Tokens.colors.surface.containerHigh,
                      color:
                        quantity === 0
                          ? m3Tokens.colors.outline.main
                          : m3Tokens.colors.onSurface.main,
                      "&:hover": {
                        backgroundColor: m3Tokens.colors.surface.containerHighest,
                      },
                    }}
                  >
                    <Remove />
                  </IconButton>

                  <Typography
                    variant="h5"
                    sx={{
                      minWidth: 56,
                      textAlign: "center",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color:
                        quantity > 0
                          ? m3Tokens.colors.primary.main
                          : m3Tokens.colors.outline.main,
                    }}
                  >
                    {quantity}
                  </Typography>

                  <IconButton
                    onClick={() => updateQuantity(task.id, 1)}
                    disabled={isLoading}
                    sx={{
                      ...counterButtonStyles,
                      backgroundColor: m3Tokens.colors.primary.main,
                      color: m3Tokens.colors.primary.contrastText,
                      "&:hover": {
                        backgroundColor: m3Tokens.colors.primary.dark,
                      },
                    }}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Total Summary */}
      {hasEntries && (
        <Card
          sx={{
            mb: 4,
            backgroundColor: m3Tokens.colors.surface.containerHigh,
            border: `1px solid ${m3Tokens.colors.primary.main}30`,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
              "&:last-child": { pb: 2 },
            }}
          >
            <Typography variant="subtitle1" color="text.secondary">
              Total Items
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                color: m3Tokens.colors.primary.main,
              }}
            >
              {totalItems}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!hasEntries || isLoading}
          startIcon={
            isLoading ? <CircularProgress size={24} color="inherit" /> : <Send />
          }
          sx={{
            py: 2,
            fontSize: "1.125rem",
            fontWeight: 600,
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
          {isLoading ? "Submitting..." : "Submit Production"}
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
          Back to Menu
        </Button>
      </Box>
    </Box>
  );
}
