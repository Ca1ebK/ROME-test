"use client";

import { Clock, LogOut, Package, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      {/* Welcome Header */}
      <div className="text-center mb-4">
        <p className="text-warehouse-gray-400 text-kiosk-sm uppercase tracking-wide">
          Welcome back
        </p>
        <h2 className="text-kiosk-xl font-bold text-warehouse-white mt-1">
          {workerName}
        </h2>
        <div className="mt-3 flex items-center justify-center gap-2">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              isClockedIn ? "bg-warehouse-success animate-pulse" : "bg-warehouse-gray-500"
            )}
          />
          <span className={cn(
            "text-kiosk-sm font-medium",
            isClockedIn ? "text-warehouse-success" : "text-warehouse-gray-400"
          )}>
            {isClockedIn ? "Currently Clocked In" : "Not Clocked In"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid gap-4 w-full">
        {/* Clock In Button */}
        <button
          type="button"
          onClick={onClockIn}
          disabled={isLoading || isClockedIn}
          className={cn(
            "flex items-center justify-center gap-4 py-6 rounded-kiosk",
            "text-kiosk-lg font-bold transition-all duration-200",
            "active:scale-98",
            isClockedIn
              ? "bg-warehouse-gray-800 text-warehouse-gray-500 cursor-not-allowed"
              : "bg-warehouse-success text-warehouse-black hover:bg-green-600 shadow-kiosk"
          )}
        >
          {loadingAction === "in" ? (
            <div className="w-8 h-8 border-3 border-warehouse-black/30 border-t-warehouse-black rounded-full animate-spin" />
          ) : (
            <Clock className="w-8 h-8" />
          )}
          <span>Clock In</span>
        </button>

        {/* Clock Out Button */}
        <button
          type="button"
          onClick={onClockOut}
          disabled={isLoading || !isClockedIn}
          className={cn(
            "flex items-center justify-center gap-4 py-6 rounded-kiosk",
            "text-kiosk-lg font-bold transition-all duration-200",
            "active:scale-98",
            !isClockedIn
              ? "bg-warehouse-gray-800 text-warehouse-gray-500 cursor-not-allowed"
              : "bg-warehouse-error text-warehouse-white hover:bg-red-600 shadow-kiosk"
          )}
        >
          {loadingAction === "out" ? (
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogOut className="w-8 h-8" />
          )}
          <span>Clock Out</span>
        </button>

        {/* Log Production Button */}
        <button
          type="button"
          onClick={onLogProduction}
          disabled={isLoading}
          className={cn(
            "flex items-center justify-center gap-4 py-6 rounded-kiosk",
            "text-kiosk-lg font-bold transition-all duration-200",
            "bg-warehouse-orange text-warehouse-black hover:bg-warehouse-orange-dark",
            "shadow-kiosk active:scale-98"
          )}
        >
          <Package className="w-8 h-8" />
          <span>Log Production</span>
        </button>
      </div>

      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className={cn(
          "flex items-center justify-center gap-2 py-4 px-6 mt-4",
          "text-kiosk-base text-warehouse-gray-400 font-medium",
          "hover:text-warehouse-white transition-colors",
          "rounded-kiosk border border-warehouse-gray-700 hover:border-warehouse-gray-500"
        )}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Different Worker</span>
      </button>
    </div>
  );
}
