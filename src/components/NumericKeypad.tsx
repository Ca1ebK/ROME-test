"use client";

import { useEffect, useRef } from "react";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  isLoading?: boolean;
  error?: string | null;
}

export function NumericKeypad({
  value,
  onChange,
  onSubmit,
  maxLength = 6,
  isLoading = false,
  error = null,
}: NumericKeypadProps) {
  const hasAutoSubmitted = useRef(false);

  const handleDigitPress = (digit: string) => {
    if (value.length < maxLength && !isLoading) {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    if (!isLoading) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!isLoading) {
      onChange("");
    }
  };

  // Keyboard input support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if loading
      if (isLoading) return;

      // Number keys (both main keyboard and numpad)
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitPress(e.key);
      }
      // Backspace or Delete
      else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        handleBackspace();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, isLoading, maxLength]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (value.length === maxLength && !isLoading && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      // Small delay for visual feedback
      const timer = setTimeout(() => {
        onSubmit();
      }, 150);
      return () => clearTimeout(timer);
    }
    
    // Reset auto-submit flag when value changes (e.g., after error clears PIN)
    if (value.length < maxLength) {
      hasAutoSubmitted.current = false;
    }
  }, [value, maxLength, isLoading, onSubmit]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* PIN Display */}
      <div className="flex flex-col items-center gap-3 w-full">
        <p className="text-warehouse-gray-400 text-kiosk-sm font-medium tracking-wide uppercase">
          Enter Your PIN
        </p>
        <div className="flex gap-2 md:gap-3">
          {Array.from({ length: maxLength }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "pin-digit transition-all duration-150",
                i < value.length && "pin-digit-filled scale-105"
              )}
            >
              {i < value.length ? (
                <span className="text-warehouse-orange">●</span>
              ) : (
                <span className="text-warehouse-gray-600">○</span>
              )}
            </div>
          ))}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-2 px-4 py-2 bg-warehouse-error/20 border border-warehouse-error rounded-lg animate-shake">
            <p className="text-warehouse-error text-kiosk-sm font-medium text-center">
              {error}
            </p>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mt-2 flex items-center gap-2 text-warehouse-gray-400">
            <div className="w-5 h-5 border-2 border-warehouse-gray-600 border-t-warehouse-orange rounded-full animate-spin" />
            <span className="text-kiosk-sm">Verifying...</span>
          </div>
        )}
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 w-full">
        {/* Digits 1-9 */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigitPress(digit.toString())}
            disabled={isLoading || value.length >= maxLength}
            className="keypad-button aspect-square"
          >
            {digit}
          </button>
        ))}

        {/* Clear Button */}
        <button
          type="button"
          onClick={handleClear}
          disabled={isLoading || value.length === 0}
          className="keypad-button aspect-square text-warehouse-gray-400 text-kiosk-base"
        >
          CLR
        </button>

        {/* Zero */}
        <button
          type="button"
          onClick={() => handleDigitPress("0")}
          disabled={isLoading || value.length >= maxLength}
          className="keypad-button aspect-square"
        >
          0
        </button>

        {/* Backspace Button */}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={isLoading || value.length === 0}
          className="keypad-button aspect-square"
        >
          <Delete className="w-8 h-8" />
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-warehouse-gray-600 text-sm text-center">
        You can also type with your keyboard
      </p>
    </div>
  );
}
