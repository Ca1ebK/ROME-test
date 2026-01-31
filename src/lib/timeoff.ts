import { createClient } from "@supabase/supabase-js";
import type { TimeOffType, RequestStatus } from "@/types/database";

// ============================================
// Supabase Client
// ============================================

const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: any = null;

if (!DEMO_MODE) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ============================================
// Types
// ============================================

export interface TimeOffRequestData {
  id: string;
  worker_id: string;
  worker_name?: string;
  type: TimeOffType;
  start_date: string;
  end_date: string;
  paid_hours: number;
  unpaid_hours: number;
  is_excused: boolean;
  is_planned: boolean;
  comments: string | null;
  status: RequestStatus;
  reviewed_by: string | null;
  reviewer_name?: string;
  reviewed_at: string | null;
  denial_reason: string | null;
  created_at: string;
}

// Demo data
let DEMO_REQUESTS: TimeOffRequestData[] = [
  {
    id: "demo-req-1",
    worker_id: "demo-1",
    worker_name: "John Smith",
    type: "vacation",
    start_date: "2026-02-14",
    end_date: "2026-02-16",
    paid_hours: 24,
    unpaid_hours: 0,
    is_excused: true,
    is_planned: true,
    comments: "Family vacation",
    status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    denial_reason: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-req-2",
    worker_id: "demo-2",
    worker_name: "Maria Garcia",
    type: "sick",
    start_date: "2026-02-01",
    end_date: "2026-02-01",
    paid_hours: 8,
    unpaid_hours: 0,
    is_excused: true,
    is_planned: false,
    comments: "Doctor appointment",
    status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    denial_reason: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-req-3",
    worker_id: "demo-4",
    worker_name: "Sarah Johnson",
    type: "personal",
    start_date: "2026-01-20",
    end_date: "2026-01-20",
    paid_hours: 8,
    unpaid_hours: 0,
    is_excused: true,
    is_planned: true,
    comments: null,
    status: "approved",
    reviewed_by: "demo-3",
    reviewer_name: "James Wilson",
    reviewed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    denial_reason: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// Time Off Request Functions
// ============================================

export async function submitTimeOffRequest(
  workerId: string,
  data: {
    type: TimeOffType;
    start_date: string;
    end_date: string;
    paid_hours: number;
    unpaid_hours: number;
    comments?: string;
  }
) {
  // Demo mode
  if (DEMO_MODE) {
    await delay(600);
    const newRequest: TimeOffRequestData = {
      id: `demo-req-${Date.now()}`,
      worker_id: workerId,
      type: data.type,
      start_date: data.start_date,
      end_date: data.end_date,
      paid_hours: data.paid_hours,
      unpaid_hours: data.unpaid_hours,
      is_excused: true,
      is_planned: true,
      comments: data.comments || null,
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
      denial_reason: null,
      created_at: new Date().toISOString(),
    };
    DEMO_REQUESTS = [newRequest, ...DEMO_REQUESTS];
    return { success: true, request: newRequest };
  }

  // Supabase mode
  const { data: result, error } = await supabase
    .from("time_off_requests")
    .insert({
      worker_id: workerId,
      type: data.type,
      start_date: data.start_date,
      end_date: data.end_date,
      paid_hours: data.paid_hours,
      unpaid_hours: data.unpaid_hours,
      comments: data.comments || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Failed to submit request." };
  }

  return { success: true, request: result };
}

export async function getMyTimeOffRequests(workerId: string) {
  // Demo mode
  if (DEMO_MODE) {
    await delay(300);
    const requests = DEMO_REQUESTS.filter((r) => r.worker_id === workerId);
    return { success: true, requests };
  }

  // Supabase mode
  const { data, error } = await supabase
    .from("time_off_requests")
    .select("*")
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "Failed to load requests." };
  }

  return { success: true, requests: data as TimeOffRequestData[] };
}

export async function getAllPendingRequests() {
  // Demo mode
  if (DEMO_MODE) {
    await delay(300);
    const pending = DEMO_REQUESTS.filter((r) => r.status === "pending");
    return { success: true, requests: pending };
  }

  // Supabase mode - join with workers to get names
  const { data, error } = await supabase
    .from("time_off_requests")
    .select(`
      *,
      worker:workers(full_name)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, error: "Failed to load requests." };
  }

  // Map to include worker name
  const requests = (data || []).map((r: { worker?: { full_name: string } }) => ({
    ...r,
    worker_name: r.worker?.full_name || "Unknown",
  }));

  return { success: true, requests: requests as TimeOffRequestData[] };
}

export async function getAllTimeOffRequests() {
  // Demo mode
  if (DEMO_MODE) {
    await delay(300);
    return { success: true, requests: DEMO_REQUESTS };
  }

  // Supabase mode
  const { data, error } = await supabase
    .from("time_off_requests")
    .select(`
      *,
      worker:workers(full_name),
      reviewer:workers!reviewed_by(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { success: false, error: "Failed to load requests." };
  }

  const requests = (data || []).map((r: { worker?: { full_name: string }; reviewer?: { full_name: string } }) => ({
    ...r,
    worker_name: r.worker?.full_name || "Unknown",
    reviewer_name: r.reviewer?.full_name || null,
  }));

  return { success: true, requests: requests as TimeOffRequestData[] };
}

export async function approveRequest(requestId: string, managerId: string) {
  // Demo mode
  if (DEMO_MODE) {
    await delay(500);
    DEMO_REQUESTS = DEMO_REQUESTS.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "approved" as const,
            reviewed_by: managerId,
            reviewed_at: new Date().toISOString(),
          }
        : r
    );
    return { success: true };
  }

  // Supabase mode
  const { error } = await supabase
    .from("time_off_requests")
    .update({
      status: "approved",
      reviewed_by: managerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    return { success: false, error: "Failed to approve request." };
  }

  return { success: true };
}

export async function denyRequest(requestId: string, managerId: string, reason?: string) {
  // Demo mode
  if (DEMO_MODE) {
    await delay(500);
    DEMO_REQUESTS = DEMO_REQUESTS.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "denied" as const,
            reviewed_by: managerId,
            reviewed_at: new Date().toISOString(),
            denial_reason: reason || null,
          }
        : r
    );
    return { success: true };
  }

  // Supabase mode
  const { error } = await supabase
    .from("time_off_requests")
    .update({
      status: "denied",
      reviewed_by: managerId,
      reviewed_at: new Date().toISOString(),
      denial_reason: reason || null,
    })
    .eq("id", requestId);

  if (error) {
    return { success: false, error: "Failed to deny request." };
  }

  return { success: true };
}
