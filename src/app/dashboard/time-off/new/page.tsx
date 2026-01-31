"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { submitTimeOffRequest } from "@/lib/timeoff";
import type { TimeOffType } from "@/types/database";

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
  const [paidHours, setPaidHours] = useState("8");
  const [unpaidHours, setUnpaidHours] = useState("0");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isValid = type && startDate && endDate && startDate <= endDate;

  const handleSubmit = async () => {
    if (!isValid) return;
    
    setIsSubmitting(true);
    
    try {
      // Get session
      const stored = localStorage.getItem("rome_session");
      if (!stored) {
        router.push("/login");
        return;
      }
      const session = JSON.parse(stored);

      // Submit to Supabase/demo
      const result = await submitTimeOffRequest(session.workerId, {
        type: type!,
        start_date: startDate,
        end_date: endDate,
        paid_hours: parseFloat(paidHours) || 0,
        unpaid_hours: parseFloat(unpaidHours) || 0,
        comments: comments || undefined,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to submit request");
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="w-20 h-20 rounded-full bg-warehouse-success/20 flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-warehouse-success" />
        </div>
        <h2 className="text-2xl font-bold text-warehouse-white mb-2">
          Request Submitted!
        </h2>
        <p className="text-warehouse-gray-400 text-center max-w-sm mb-8">
          Your manager will be notified and you&apos;ll receive an email when it&apos;s approved or denied.
        </p>
        <button
          onClick={() => router.push("/dashboard/time-off")}
          className={cn(
            "px-6 py-3 rounded-xl font-semibold",
            "bg-warehouse-gray-800 text-warehouse-white",
            "hover:bg-warehouse-gray-700 transition-colors"
          )}
        >
          Back to Time Off
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 text-warehouse-gray-400 hover:text-warehouse-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-warehouse-white">
          Request Time Off
        </h1>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Type Selection */}
        <div>
          <label className="block text-warehouse-gray-400 text-sm font-medium mb-2">
            Type of Absence *
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_OFF_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                  type === t.value
                    ? "bg-warehouse-orange text-warehouse-black"
                    : "bg-warehouse-gray-800 text-warehouse-gray-300 hover:bg-warehouse-gray-700"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-warehouse-gray-400 text-sm font-medium mb-2">
              From *
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                }}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-warehouse-gray-800 text-warehouse-white",
                  "border border-warehouse-gray-600",
                  "focus:border-warehouse-orange focus:outline-none"
                )}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warehouse-gray-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-warehouse-gray-400 text-sm font-medium mb-2">
              To *
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl",
                  "bg-warehouse-gray-800 text-warehouse-white",
                  "border border-warehouse-gray-600",
                  "focus:border-warehouse-orange focus:outline-none"
                )}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warehouse-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-warehouse-gray-400 text-sm font-medium mb-2">
              Paid Hours
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={paidHours}
              onChange={(e) => setPaidHours(e.target.value)}
              className={cn(
                "w-full px-4 py-3 rounded-xl",
                "bg-warehouse-gray-800 text-warehouse-white",
                "border border-warehouse-gray-600",
                "focus:border-warehouse-orange focus:outline-none"
              )}
            />
          </div>
          <div>
            <label className="block text-warehouse-gray-400 text-sm font-medium mb-2">
              Unpaid Hours
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={unpaidHours}
              onChange={(e) => setUnpaidHours(e.target.value)}
              className={cn(
                "w-full px-4 py-3 rounded-xl",
                "bg-warehouse-gray-800 text-warehouse-white",
                "border border-warehouse-gray-600",
                "focus:border-warehouse-orange focus:outline-none"
              )}
            />
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-warehouse-gray-400 text-sm font-medium mb-2">
            Reason / Comments
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder="Optional"
            className={cn(
              "w-full px-4 py-3 rounded-xl resize-none",
              "bg-warehouse-gray-800 text-warehouse-white",
              "border border-warehouse-gray-600",
              "focus:border-warehouse-orange focus:outline-none",
              "placeholder:text-warehouse-gray-500"
            )}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        className={cn(
          "w-full py-4 rounded-xl font-bold text-lg transition-all",
          "flex items-center justify-center gap-2",
          isValid && !isSubmitting
            ? "bg-warehouse-success text-warehouse-black hover:bg-green-600"
            : "bg-warehouse-gray-800 text-warehouse-gray-500 cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <div className="w-6 h-6 border-2 border-warehouse-black/30 border-t-warehouse-black rounded-full animate-spin" />
        ) : (
          "Submit Request"
        )}
      </button>
    </div>
  );
}
