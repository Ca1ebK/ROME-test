"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyTimeOffRequests, type TimeOffRequestData } from "@/lib/timeoff";
import type { TimeOffType, RequestStatus } from "@/types/database";

const TYPE_LABELS: Record<TimeOffType, string> = {
  vacation: "Vacation",
  personal: "Personal",
  sick: "Sick",
  bereavement: "Bereavement",
  unpaid: "Unpaid",
};

const STATUS_CONFIG: Record<RequestStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  approved: { icon: CheckCircle, color: "text-warehouse-success", label: "Approved" },
  denied: { icon: XCircle, color: "text-warehouse-error", label: "Denied" },
};

export default function TimeOffPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<TimeOffRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      const stored = localStorage.getItem("rome_session");
      if (!stored) {
        router.push("/login");
        return;
      }
      const session = JSON.parse(stored);
      
      const result = await getMyTimeOffRequests(session.workerId);
      if (result.success && result.requests) {
        setRequests(result.requests);
      }
      setIsLoading(false);
    };
    
    loadRequests();
  }, [router]);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    if (start === end) {
      return `${startStr}, ${startDate.getFullYear()}`;
    }
    
    const endStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${startStr}-${endStr}, ${endDate.getFullYear()}`;
  };

  const getDayCount = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const pastRequests = requests.filter((r) => r.status !== "pending");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-warehouse-gray-600 border-t-warehouse-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Request Button */}
      <button
        onClick={() => router.push("/dashboard/time-off/new")}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-4 rounded-xl",
          "bg-warehouse-orange text-warehouse-black font-bold text-lg",
          "hover:bg-warehouse-orange-dark transition-colors",
          "active:scale-98"
        )}
      >
        <Plus className="w-6 h-6" />
        Request Time Off
      </button>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-warehouse-gray-400 text-sm font-medium uppercase tracking-wide mb-3">
            Pending
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((request) => {
              const StatusIcon = STATUS_CONFIG[request.status].icon;
              return (
                <div
                  key={request.id}
                  className="bg-warehouse-gray-800 rounded-xl p-4 border border-warehouse-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <StatusIcon className={cn("w-5 h-5 mt-0.5", STATUS_CONFIG[request.status].color)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-warehouse-white font-semibold">
                          {TYPE_LABELS[request.type]}
                        </span>
                      </div>
                      <p className="text-warehouse-gray-400 text-sm mt-1">
                        {formatDateRange(request.start_date, request.end_date)} ({getDayCount(request.start_date, request.end_date)})
                      </p>
                      <p className="text-warehouse-gray-500 text-xs mt-1">
                        Submitted {new Date(request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-yellow-500 text-xs mt-1">
                        Awaiting manager approval
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Requests */}
      <div>
        <h2 className="text-warehouse-gray-400 text-sm font-medium uppercase tracking-wide mb-3">
          Past Requests
        </h2>
        {pastRequests.length === 0 ? (
          <p className="text-warehouse-gray-500 text-sm text-center py-8">
            No past requests
          </p>
        ) : (
          <div className="space-y-3">
            {pastRequests.map((request) => {
              const StatusIcon = STATUS_CONFIG[request.status].icon;
              return (
                <div
                  key={request.id}
                  className="bg-warehouse-gray-800 rounded-xl p-4 border border-warehouse-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <StatusIcon className={cn("w-5 h-5 mt-0.5", STATUS_CONFIG[request.status].color)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-warehouse-white font-semibold">
                          {TYPE_LABELS[request.type]}
                        </span>
                      </div>
                      <p className="text-warehouse-gray-400 text-sm mt-1">
                        {formatDateRange(request.start_date, request.end_date)} ({getDayCount(request.start_date, request.end_date)})
                      </p>
                      <p className={cn("text-xs mt-1", STATUS_CONFIG[request.status].color)}>
                        {request.status === "approved" && `Approved${request.reviewer_name ? ` by ${request.reviewer_name}` : ""}`}
                        {request.status === "denied" && (request.denial_reason || "Denied")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
