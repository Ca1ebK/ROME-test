"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, User, Calendar } from "lucide-react";
import { getAllTimeOffRequests, type TimeOffRequestData } from "@/lib/timeoff";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  vacation: "Vacation",
  personal: "Personal",
  sick: "Sick",
  bereavement: "Bereavement",
  unpaid: "Unpaid",
};

export default function ManagerHistoryPage() {
  const [requests, setRequests] = useState<TimeOffRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "denied">("all");

  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      const result = await getAllTimeOffRequests();
      if (result.success && result.requests) {
        // Filter out pending ones for history
        setRequests(result.requests.filter((r) => r.status !== "pending"));
      }
      setIsLoading(false);
    };

    loadRequests();
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    if (start === end) {
      return formatDate(start);
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-warehouse-gray-600 border-t-warehouse-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warehouse-white">
          Request History
        </h1>
        <p className="text-warehouse-gray-400 text-sm mt-1">
          Past time off decisions
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(["all", "approved", "denied"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
              filter === f
                ? "bg-warehouse-orange text-warehouse-black"
                : "bg-warehouse-gray-800 text-warehouse-gray-400 hover:text-warehouse-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-warehouse-gray-400">No {filter !== "all" ? filter : ""} requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-warehouse-gray-800 rounded-xl p-4 border border-warehouse-gray-700"
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                {request.status === "approved" ? (
                  <CheckCircle className="w-5 h-5 text-warehouse-success flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-warehouse-error flex-shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1 min-w-0">
                  {/* Worker & Type */}
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-warehouse-gray-500" />
                    <span className="text-warehouse-white font-medium">
                      {request.worker_name || "Unknown"}
                    </span>
                    <span className="text-warehouse-gray-500">•</span>
                    <span className="text-warehouse-gray-400 text-sm">
                      {TYPE_LABELS[request.type] || request.type}
                    </span>
                  </div>
                  
                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm text-warehouse-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    {formatDateRange(request.start_date, request.end_date)}
                  </div>
                  
                  {/* Review Info */}
                  <p className="text-xs text-warehouse-gray-500">
                    {request.status === "approved" ? "Approved" : "Denied"} by{" "}
                    {request.reviewer_name || "Manager"}
                    {request.reviewed_at && (
                      <> on {formatDate(request.reviewed_at)}</>
                    )}
                  </p>
                  
                  {/* Denial Reason */}
                  {request.status === "denied" && request.denial_reason && (
                    <p className="text-sm text-warehouse-error/80 mt-2 italic">
                      &quot;{request.denial_reason}&quot;
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
