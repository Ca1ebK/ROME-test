"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorRetryProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorRetry({ message, onRetry, isRetrying = false }: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 max-w-md mx-auto">
      {/* Error Icon */}
      <div className="w-20 h-20 rounded-full bg-warehouse-error/20 flex items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-warehouse-error" />
      </div>

      {/* Error Message */}
      <div className="text-center">
        <h3 className="text-kiosk-lg font-bold text-warehouse-white mb-2">
          Something went wrong
        </h3>
        <p className="text-kiosk-sm text-warehouse-gray-400">
          {message}
        </p>
      </div>

      {/* Retry Button */}
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className={cn(
          "flex items-center justify-center gap-3 py-4 px-8",
          "rounded-kiosk text-kiosk-lg font-bold",
          "bg-warehouse-orange text-warehouse-black",
          "hover:bg-warehouse-orange-dark shadow-kiosk",
          "transition-all duration-200 active:scale-98",
          "disabled:opacity-50"
        )}
      >
        <RefreshCw className={cn("w-6 h-6", isRetrying && "animate-spin")} />
        <span>{isRetrying ? "Retrying..." : "Try Again"}</span>
      </button>

      {/* "Software doesn't kill itself" reminder */}
      <p className="text-xs text-warehouse-gray-600 text-center mt-4">
        If this problem persists, please contact a supervisor.
      </p>
    </div>
  );
}
