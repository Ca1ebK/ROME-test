"use client";

import { useState } from "react";
import { Minus, Plus, ArrowLeft, Send, Package, Boxes, Truck, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

// Hardcoded task list for Scholastic warehouse
const TASKS = [
  { id: "box-packing", name: "Box Packing", icon: Package },
  { id: "table-sorting", name: "Table Sorting", icon: LayoutGrid },
  { id: "pallet-loading", name: "Pallet Loading", icon: Boxes },
  { id: "shipping-receiving", name: "Shipping/Receiving", icon: Truck },
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

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-8">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-warehouse-gray-400 text-kiosk-sm uppercase tracking-wide">
          Production Log
        </p>
        <h2 className="text-kiosk-lg font-bold text-warehouse-white mt-1">
          {workerName}
        </h2>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-4 mb-8">
        {TASKS.map((task) => {
          const Icon = task.icon;
          const quantity = quantities[task.id];
          
          return (
            <div key={task.id} className="task-row">
              {/* Task Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-warehouse-gray-700 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-warehouse-orange" />
                </div>
                <span className="text-kiosk-base font-semibold text-warehouse-white">
                  {task.name}
                </span>
              </div>

              {/* Counter Controls */}
              <div className="flex items-center gap-3">
                {/* Minus Button */}
                <button
                  type="button"
                  onClick={() => updateQuantity(task.id, -1)}
                  disabled={quantity === 0 || isLoading}
                  className={cn(
                    "counter-button",
                    quantity === 0
                      ? "bg-warehouse-gray-700 text-warehouse-gray-500 cursor-not-allowed"
                      : "bg-warehouse-gray-700 text-warehouse-white hover:bg-warehouse-gray-600 active:bg-warehouse-gray-500"
                  )}
                >
                  <Minus className="w-6 h-6" />
                </button>

                {/* Quantity Display */}
                <div className="w-20 md:w-24 text-center">
                  <span
                    className={cn(
                      "text-kiosk-xl font-mono font-bold",
                      quantity > 0 ? "text-warehouse-orange" : "text-warehouse-gray-500"
                    )}
                  >
                    {quantity}
                  </span>
                </div>

                {/* Plus Button */}
                <button
                  type="button"
                  onClick={() => updateQuantity(task.id, 1)}
                  disabled={isLoading}
                  className={cn(
                    "counter-button",
                    "bg-warehouse-orange text-warehouse-black",
                    "hover:bg-warehouse-orange-dark active:bg-warehouse-orange-light"
                  )}
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Summary */}
      {hasEntries && (
        <div className="mb-6 p-4 bg-warehouse-gray-800 rounded-kiosk border border-warehouse-orange/30">
          <div className="flex items-center justify-between">
            <span className="text-kiosk-base text-warehouse-gray-300">Total Items</span>
            <span className="text-kiosk-lg font-bold text-warehouse-orange font-mono">
              {totalItems}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasEntries || isLoading}
          className={cn(
            "flex items-center justify-center gap-3 py-5 rounded-kiosk",
            "text-kiosk-lg font-bold transition-all duration-200",
            "active:scale-98",
            hasEntries && !isLoading
              ? "bg-warehouse-success text-warehouse-black hover:bg-green-600 shadow-kiosk"
              : "bg-warehouse-gray-800 text-warehouse-gray-500 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="w-7 h-7 border-3 border-warehouse-black/30 border-t-warehouse-black rounded-full animate-spin" />
          ) : (
            <Send className="w-7 h-7" />
          )}
          <span>{isLoading ? "Submitting..." : "Submit Production"}</span>
        </button>

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className={cn(
            "flex items-center justify-center gap-2 py-4",
            "text-kiosk-base text-warehouse-gray-400 font-medium",
            "hover:text-warehouse-white transition-colors",
            "rounded-kiosk border border-warehouse-gray-700 hover:border-warehouse-gray-500"
          )}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Menu</span>
        </button>
      </div>
    </div>
  );
}
