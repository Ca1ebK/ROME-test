"use client";

import { useEffect, useState } from "react";
import { Check, X, Clock, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getAllPendingRequests, approveRequest, denyRequest, type TimeOffRequestData } from "@/lib/timeoff";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  vacation: "Vacation",
  personal: "Personal",
  sick: "Sick",
  bereavement: "Bereavement",
  unpaid: "Unpaid",
};

const TYPE_COLORS: Record<string, string> = {
  vacation: "bg-blue-500/20 text-blue-400",
  personal: "bg-purple-500/20 text-purple-400",
  sick: "bg-red-500/20 text-red-400",
  bereavement: "bg-gray-500/20 text-gray-400",
  unpaid: "bg-yellow-500/20 text-yellow-400",
};

export default function ManagerPendingPage() {
  const [requests, setRequests] = useState<TimeOffRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showDenyModal, setShowDenyModal] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState("");

  // Get manager ID from session
  const getManagerId = () => {
    const stored = localStorage.getItem("rome_session");
    if (stored) {
      return JSON.parse(stored).workerId;
    }
    return null;
  };

  const loadRequests = async () => {
    setIsLoading(true);
    const result = await getAllPendingRequests();
    if (result.success && result.requests) {
      setRequests(result.requests);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    const managerId = getManagerId();
    if (!managerId) return;

    setProcessingId(requestId);
    const result = await approveRequest(requestId, managerId);
    
    if (result.success) {
      toast.success("Request approved!");
      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } else {
      toast.error("Failed to approve request");
    }
    
    setProcessingId(null);
  };

  const handleDeny = async (requestId: string) => {
    const managerId = getManagerId();
    if (!managerId) return;

    setProcessingId(requestId);
    const result = await denyRequest(requestId, managerId, denyReason);
    
    if (result.success) {
      toast.success("Request denied");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setShowDenyModal(null);
      setDenyReason("");
    } else {
      toast.error("Failed to deny request");
    }
    
    setProcessingId(null);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    
    if (start === end) {
      return startDate.toLocaleDateString("en-US", { ...opts, weekday: "short" });
    }
    
    return `${startDate.toLocaleDateString("en-US", opts)} - ${endDate.toLocaleDateString("en-US", opts)}`;
  };

  const getDayCount = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    }
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    }
    return "Just now";
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
          Pending Requests
        </h1>
        <p className="text-warehouse-gray-400 text-sm mt-1">
          {requests.length} request{requests.length !== 1 ? "s" : ""} awaiting approval
        </p>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-warehouse-gray-800 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-warehouse-success" />
          </div>
          <p className="text-warehouse-gray-400 text-lg">All caught up!</p>
          <p className="text-warehouse-gray-500 text-sm mt-1">No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-warehouse-gray-800 rounded-xl p-4 border border-warehouse-gray-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warehouse-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-warehouse-gray-400" />
                  </div>
                  <div>
                    <p className="text-warehouse-white font-semibold">
                      {request.worker_name || "Unknown Worker"}
                    </p>
                    <p className="text-warehouse-gray-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(request.created_at)}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  TYPE_COLORS[request.type] || "bg-gray-500/20 text-gray-400"
                )}>
                  {TYPE_LABELS[request.type] || request.type}
                </span>
              </div>

              {/* Details */}
              <div className="bg-warehouse-gray-900 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-warehouse-white mb-2">
                  <Calendar className="w-4 h-4 text-warehouse-orange" />
                  <span className="font-medium">
                    {formatDateRange(request.start_date, request.end_date)}
                  </span>
                  <span className="text-warehouse-gray-500">
                    ({getDayCount(request.start_date, request.end_date)})
                  </span>
                </div>
                
                {request.paid_hours > 0 && (
                  <p className="text-warehouse-gray-400 text-sm">
                    Paid: {request.paid_hours}h
                  </p>
                )}
                {request.unpaid_hours > 0 && (
                  <p className="text-warehouse-gray-400 text-sm">
                    Unpaid: {request.unpaid_hours}h
                  </p>
                )}
                
                {request.comments && (
                  <p className="text-warehouse-gray-400 text-sm mt-2 italic">
                    &quot;{request.comments}&quot;
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(request.id)}
                  disabled={processingId === request.id}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors",
                    "bg-warehouse-success text-warehouse-black hover:bg-green-600",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {processingId === request.id ? (
                    <div className="w-5 h-5 border-2 border-warehouse-black/30 border-t-warehouse-black rounded-full animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  Approve
                </button>
                
                <button
                  onClick={() => setShowDenyModal(request.id)}
                  disabled={processingId === request.id}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors",
                    "bg-warehouse-gray-700 text-warehouse-white hover:bg-warehouse-gray-600",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <X className="w-5 h-5" />
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deny Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-warehouse-gray-800 rounded-xl p-6 w-full max-w-md border border-warehouse-gray-700">
            <h3 className="text-xl font-bold text-warehouse-white mb-4">
              Deny Request?
            </h3>
            
            <div className="mb-4">
              <label className="block text-warehouse-gray-400 text-sm mb-2">
                Reason (optional)
              </label>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="e.g., Coverage unavailable"
                rows={3}
                className={cn(
                  "w-full px-4 py-3 rounded-xl resize-none",
                  "bg-warehouse-gray-900 text-warehouse-white",
                  "border border-warehouse-gray-600",
                  "focus:border-warehouse-orange focus:outline-none",
                  "placeholder:text-warehouse-gray-500"
                )}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDenyModal(null);
                  setDenyReason("");
                }}
                className="flex-1 py-3 rounded-lg font-semibold bg-warehouse-gray-700 text-warehouse-white hover:bg-warehouse-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeny(showDenyModal)}
                disabled={processingId !== null}
                className="flex-1 py-3 rounded-lg font-semibold bg-warehouse-error text-warehouse-white hover:bg-red-600 disabled:opacity-50"
              >
                Deny Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
