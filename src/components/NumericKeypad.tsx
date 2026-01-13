"use client";

import { Delete, ArrowRight } from "lucide-react";
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
  const handleDigitPress = (digit: string) => {
    if (value.length < maxLength) {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange("");
  };

  const canSubmit = value.length === maxLength && !isLoading;

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
                "pin-digit",
                i < value.length && "pin-digit-filled"
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
          <div className="mt-2 px-4 py-2 bg-warehouse-error/20 border border-warehouse-error rounded-lg">
            <p className="text-warehouse-error text-kiosk-sm font-medium text-center">
              {error}
            </p>
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

      {/* Submit Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className={cn(
          "w-full py-5 rounded-kiosk text-kiosk-lg font-bold",
          "flex items-center justify-center gap-3",
          "transition-all duration-200",
          canSubmit
            ? "bg-warehouse-orange text-warehouse-black hover:bg-warehouse-orange-dark shadow-kiosk active:scale-98"
            : "bg-warehouse-gray-800 text-warehouse-gray-500 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-warehouse-black/30 border-t-warehouse-black rounded-full animate-spin" />
            <span>Verifying...</span>
          </div>
        ) : (
          <>
            <span>Continue</span>
            <ArrowRight className="w-7 h-7" />
          </>
        )}
      </button>
    </div>
  );
}
