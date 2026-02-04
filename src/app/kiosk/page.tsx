"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import {
  NumericKeypad,
  ActionButtons,
  ProductionLog,
  ErrorRetry,
  AddWorker,
} from "@/components";
import {
  authenticateWorker,
  getWorkerStatus,
  clockIn,
  clockOut,
  logProduction,
  createWorker,
  type ProductionEntry,
} from "@/lib/supabase";
import { m3Tokens } from "@/theme";

type KioskScreen = "pin" | "actions" | "production" | "error" | "admin";

interface WorkerSession {
  id: string;
  name: string;
  isClockedIn: boolean;
  clockInTime: string | null;
}

export default function KioskPage() {
  // Screen navigation state
  const [screen, setScreen] = useState<KioskScreen>("pin");

  // PIN entry state
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isPinLoading, setIsPinLoading] = useState(false);

  // Worker session state
  const [worker, setWorker] = useState<WorkerSession | null>(null);

  // Action loading states
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"in" | "out" | null>(null);

  // Error state for retry functionality
  const [errorMessage, setErrorMessage] = useState("");
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Reset to PIN screen (defined first so other handlers can use it)
  const handleReset = useCallback(() => {
    setPin("");
    setPinError(null);
    setWorker(null);
    setScreen("pin");
    setErrorMessage("");
    setRetryAction(null);
  }, []);

  // Handle PIN submission
  const handlePinSubmit = useCallback(async () => {
    if (pin.length !== 6) return;

    setIsPinLoading(true);
    setPinError(null);

    try {
      const authResult = await authenticateWorker(pin);

      if (!authResult.success || !authResult.worker) {
        setPinError(authResult.error || "Invalid PIN");
        setPin("");
        return;
      }

      // Check if this is admin login
      if (authResult.isAdmin) {
        setPin("");
        setScreen("admin");
        return;
      }

      // Get worker's current clock status
      const statusResult = await getWorkerStatus(authResult.worker.id);

      setWorker({
        id: authResult.worker.id,
        name: authResult.worker.full_name,
        isClockedIn: statusResult.isClockedIn,
        clockInTime: statusResult.clockInTime,
      });

      setPin("");
      setScreen("actions");
    } catch (error) {
      console.error("PIN authentication error:", error);
      setErrorMessage("Unable to connect. Please check your network.");
      setRetryAction(() => handlePinSubmit);
      setScreen("error");
    } finally {
      setIsPinLoading(false);
    }
  }, [pin]);

  // Handle Clock In
  const handleClockIn = useCallback(async () => {
    if (!worker) return;

    setIsActionLoading(true);
    setLoadingAction("in");

    try {
      const result = await clockIn(worker.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Clocked In!", {
        description: `Welcome, ${worker.name}. Your shift has started.`,
        duration: 4000,
      });

      // Reset to PIN screen so another worker can use the kiosk
      setTimeout(() => {
        handleReset();
      }, 1500);
    } catch (error) {
      console.error("Clock in error:", error);
      setErrorMessage("Failed to clock in. Please try again.");
      setRetryAction(() => handleClockIn);
      setScreen("error");
    } finally {
      setIsActionLoading(false);
      setLoadingAction(null);
    }
  }, [worker, handleReset]);

  // Handle Clock Out
  const handleClockOut = useCallback(async () => {
    if (!worker) return;

    setIsActionLoading(true);
    setLoadingAction("out");

    try {
      const result = await clockOut(worker.id, worker.clockInTime);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Show time worked in the toast
      const timeWorkedMessage = result.timeWorked
        ? `You worked ${result.timeWorked} this session.`
        : `Goodbye, ${worker.name}!`;

      toast.success("Clocked Out!", {
        description: timeWorkedMessage,
        duration: 6000,
      });

      // Reset to PIN screen after clock out
      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (error) {
      console.error("Clock out error:", error);
      setErrorMessage("Failed to clock out. Please try again.");
      setRetryAction(() => handleClockOut);
      setScreen("error");
    } finally {
      setIsActionLoading(false);
      setLoadingAction(null);
    }
  }, [worker, handleReset]);

  // Handle Production Log Submission
  const handleProductionSubmit = useCallback(
    async (entries: ProductionEntry[]) => {
      if (!worker || entries.length === 0) return;

      setIsActionLoading(true);

      try {
        const result = await logProduction(worker.id, entries);

        if (!result.success) {
          throw new Error(result.error);
        }

        const totalQuantity = entries.reduce((sum, e) => sum + e.quantity, 0);

        toast.success("Production Logged!", {
          description: `${totalQuantity} items recorded successfully.`,
          duration: 4000,
        });

        // Reset to PIN screen after logging production
        setTimeout(() => {
          handleReset();
        }, 1500);
      } catch (error) {
        console.error("Production log error:", error);
        setErrorMessage("Failed to log production. Please try again.");
        setRetryAction(() => () => handleProductionSubmit(entries));
        setScreen("error");
      } finally {
        setIsActionLoading(false);
      }
    },
    [worker, handleReset]
  );

  // Handle adding a new worker (admin)
  const handleAddWorker = useCallback(
    async (newPin: string, name: string, role: string) => {
      setIsActionLoading(true);

      try {
        const result = await createWorker(newPin, name, role);

        if (!result.success) {
          toast.error("Failed to create worker", {
            description: result.error,
            duration: 4000,
          });
          return;
        }

        toast.success("Worker Created!", {
          description: `${name} can now clock in with PIN: ${newPin}`,
          duration: 5000,
        });

        // Reset to PIN screen
        setTimeout(() => {
          handleReset();
        }, 1500);
      } catch (error) {
        console.error("Create worker error:", error);
        toast.error("Failed to create worker", {
          description: "Please try again.",
          duration: 4000,
        });
      } finally {
        setIsActionLoading(false);
      }
    },
    [handleReset]
  );

  // Handle navigating to production log
  const handleLogProduction = useCallback(() => {
    setScreen("production");
  }, []);

  // Back to actions from production
  const handleBackToActions = useCallback(() => {
    setScreen("actions");
  }, []);

  // Handle retry from error screen
  const handleRetry = useCallback(async () => {
    if (!retryAction) {
      handleReset();
      return;
    }

    setIsRetrying(true);

    try {
      await retryAction();
      // If successful, the retryAction will handle screen transition
    } catch {
      // Error is already handled in the retry action
    } finally {
      setIsRetrying(false);
    }
  }, [retryAction, handleReset]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        backgroundColor: m3Tokens.colors.surface.main,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
          borderBottom: `1px solid ${m3Tokens.colors.outline.variant}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: m3Tokens.colors.primary.main,
              fontWeight: "bold",
              fontSize: "1.25rem",
            }}
          >
            R
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              ROME
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: m3Tokens.colors.onSurface.variant,
                letterSpacing: 1,
              }}
            >
              SCHOLASTIC WAREHOUSE
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4,
          px: 2,
          mb: 4,
        }}
      >
        {screen === "pin" && (
          <NumericKeypad
            value={pin}
            onChange={setPin}
            onSubmit={handlePinSubmit}
            maxLength={6}
            isLoading={isPinLoading}
            error={pinError}
          />
        )}

        {screen === "actions" && worker && (
          <ActionButtons
            workerName={worker.name}
            isClockedIn={worker.isClockedIn}
            isLoading={isActionLoading}
            loadingAction={loadingAction}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onLogProduction={handleLogProduction}
            onBack={handleReset}
          />
        )}

        {screen === "production" && worker && (
          <ProductionLog
            workerName={worker.name}
            isLoading={isActionLoading}
            onSubmit={handleProductionSubmit}
            onBack={handleBackToActions}
          />
        )}

        {screen === "admin" && (
          <AddWorker
            isLoading={isActionLoading}
            onSubmit={handleAddWorker}
            onBack={handleReset}
          />
        )}

        {screen === "error" && (
          <ErrorRetry
            message={errorMessage}
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
        )}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          mt: "auto",
          textAlign: "center",
          borderTop: `1px solid ${m3Tokens.colors.outline.variant}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: m3Tokens.colors.onSurface.variant, mb: 1, display: "block" }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
        <Link
          href="/login"
          sx={{
            color: m3Tokens.colors.onSurface.variant,
            textDecoration: "none",
            fontSize: "0.75rem",
            "&:hover": {
              color: m3Tokens.colors.primary.main,
            },
          }}
        >
          View your hours & request time off →
        </Link>
      </Box>
    </Box>
  );
}
