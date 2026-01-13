"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { NumericKeypad } from "@/components/NumericKeypad";
import { ActionButtons } from "@/components/ActionButtons";
import { ProductionLog } from "@/components/ProductionLog";
import { ErrorRetry } from "@/components/ErrorRetry";
import {
  authenticateWorker,
  getWorkerStatus,
  clockIn,
  clockOut,
  logProduction,
  type ProductionEntry,
} from "@/lib/supabase";

type KioskScreen = "pin" | "actions" | "production" | "error";

interface WorkerSession {
  id: string;
  name: string;
  isClockedIn: boolean;
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
      
      // Get worker's current clock status
      const statusResult = await getWorkerStatus(authResult.worker.id);
      
      setWorker({
        id: authResult.worker.id,
        name: authResult.worker.full_name,
        isClockedIn: statusResult.isClockedIn,
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
      
      setWorker((prev) => prev ? { ...prev, isClockedIn: true } : null);
      
      toast.success("Clocked In!", {
        description: `Welcome, ${worker.name}. Your shift has started.`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error("Clock in error:", error);
      setErrorMessage("Failed to clock in. Please try again.");
      setRetryAction(() => handleClockIn);
      setScreen("error");
    } finally {
      setIsActionLoading(false);
      setLoadingAction(null);
    }
  }, [worker]);

  // Handle Clock Out
  const handleClockOut = useCallback(async () => {
    if (!worker) return;
    
    setIsActionLoading(true);
    setLoadingAction("out");
    
    try {
      const result = await clockOut(worker.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.success("Clocked Out!", {
        description: `Goodbye, ${worker.name}. See you next time!`,
        duration: 4000,
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
  }, [worker]);

  // Handle Production Log Submission
  const handleProductionSubmit = useCallback(async (entries: ProductionEntry[]) => {
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
      
      // Go back to actions screen
      setScreen("actions");
      
    } catch (error) {
      console.error("Production log error:", error);
      setErrorMessage("Failed to log production. Please try again.");
      setRetryAction(() => () => handleProductionSubmit(entries));
      setScreen("error");
    } finally {
      setIsActionLoading(false);
    }
  }, [worker]);

  // Handle navigating to production log
  const handleLogProduction = useCallback(() => {
    setScreen("production");
  }, []);

  // Reset to PIN screen
  const handleReset = useCallback(() => {
    setPin("");
    setPinError(null);
    setWorker(null);
    setScreen("pin");
    setErrorMessage("");
    setRetryAction(null);
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
    <main className="min-h-dvh bg-warehouse-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center py-6 border-b border-warehouse-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warehouse-orange flex items-center justify-center">
            <span className="text-warehouse-black font-bold text-xl">R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-warehouse-white tracking-tight">
              ROME
            </h1>
            <p className="text-xs text-warehouse-gray-500 uppercase tracking-wider">
              Scholastic Warehouse
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 safe-area-inset">
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

        {screen === "error" && (
          <ErrorRetry
            message={errorMessage}
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-warehouse-gray-800">
        <p className="text-xs text-warehouse-gray-600">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </footer>
    </main>
  );
}
