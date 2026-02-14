/**
 * Kiosk-specific operations
 * - Worker authentication (PIN-only)
 * - Clock in/out
 * - Production logging
 * - Worker creation (admin)
 */

import { getSupabaseClient, isDemoMode, delay, getDemoWorkers, addDemoWorker } from "./supabase-shared";
import { formatDuration } from "./utils";

// ============================================
// Demo State (Kiosk-specific)
// ============================================

// Track demo clock-in state in memory
const demoClockState: Record<string, { isClockedIn: boolean; clockInTime: string | null }> = {};

// ============================================
// Worker Authentication (Kiosk)
// ============================================

export async function authenticateWorker(pin: string) {
  // Special admin PIN for adding workers
  if (pin === "000000") {
    return {
      success: true,
      worker: { id: "admin", full_name: "Administrator", role: "admin" },
      isAdmin: true,
    };
  }

  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  // Demo mode
  if (DEMO_MODE) {
    await delay(500);
    const DEMO_WORKERS = getDemoWorkers();
    const worker = DEMO_WORKERS.find((w) => w.pin === pin);
    if (!worker) {
      return { success: false, error: "Invalid PIN. Please try again." };
    }
    return { 
      success: true, 
      worker: { id: worker.id, full_name: worker.full_name, role: worker.role },
      isAdmin: false,
    };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("workers")
    .select("id, full_name, role")
    .eq("pin", pin)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return { success: false, error: "Invalid PIN. Please try again." };
  }

  return { success: true, worker: data, isAdmin: false };
}

// ============================================
// Worker Status
// ============================================

export async function getWorkerStatus(workerId: string) {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  // Demo mode
  if (DEMO_MODE) {
    await delay(200);
    const state = demoClockState[workerId];
    return { 
      isClockedIn: state?.isClockedIn ?? false, 
      clockInTime: state?.clockInTime ?? null,
      lastPunch: null,
    };
  }

  // Supabase mode - get last punch
  const { data, error } = await supabase!
    .from("punches")
    .select("type, timestamp")
    .eq("worker_id", workerId)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return { isClockedIn: false, clockInTime: null, lastPunch: null };
  }

  const punchData = data as { type: "IN" | "OUT"; timestamp: string };
  let clockInTime: string | null = null;
  if (punchData.type === "IN") {
    clockInTime = punchData.timestamp;
  }

  return {
    isClockedIn: punchData.type === "IN",
    clockInTime,
    lastPunch: punchData,
  };
}

// ============================================
// Clock In/Out Operations
// ============================================

export async function clockIn(workerId: string) {
  const clockInTime = new Date().toISOString();
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();
  
  // Demo mode
  if (DEMO_MODE) {
    await delay(600);
    demoClockState[workerId] = { isClockedIn: true, clockInTime };
    return { 
      success: true, 
      punch: { id: "demo-punch", worker_id: workerId, type: "IN" as const, timestamp: clockInTime },
    };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("punches")
    .insert({
      worker_id: workerId,
      type: "IN" as const,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Failed to clock in. Please try again." };
  }

  return { success: true, punch: data };
}

export async function clockOut(workerId: string, clockInTime: string | null) {
  const clockOutTime = new Date();
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();
  
  // Calculate time worked
  let timeWorkedMs = 0;
  let timeWorkedFormatted = "Unknown";
  
  if (clockInTime) {
    const clockIn = new Date(clockInTime);
    timeWorkedMs = clockOutTime.getTime() - clockIn.getTime();
    timeWorkedFormatted = formatDuration(timeWorkedMs);
  }
  
  // Demo mode
  if (DEMO_MODE) {
    await delay(600);
    demoClockState[workerId] = { isClockedIn: false, clockInTime: null };
    return { 
      success: true, 
      punch: { id: "demo-punch", worker_id: workerId, type: "OUT" as const, timestamp: clockOutTime.toISOString() },
      timeWorked: timeWorkedFormatted,
      timeWorkedMs,
    };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("punches")
    .insert({
      worker_id: workerId,
      type: "OUT" as const,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Failed to clock out. Please try again." };
  }

  return { success: true, punch: data, timeWorked: timeWorkedFormatted, timeWorkedMs };
}

// ============================================
// Worker Management (Admin)
// ============================================

export async function createWorker(pin: string, fullName: string, role: string = "worker") {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  // Validate PIN
  if (!/^\d{6}$/.test(pin)) {
    return { success: false, error: "PIN must be exactly 6 digits." };
  }
  
  if (!fullName.trim()) {
    return { success: false, error: "Name is required." };
  }

  // Demo mode
  if (DEMO_MODE) {
    await delay(600);
    const DEMO_WORKERS = getDemoWorkers();
    
    // Check if PIN already exists
    if (DEMO_WORKERS.some((w) => w.pin === pin)) {
      return { success: false, error: "This PIN is already in use." };
    }
    
    const newWorker = {
      id: `demo-${Date.now()}`,
      pin,
      full_name: fullName.trim(),
      role,
    };
    
    addDemoWorker(newWorker);
    console.log("👤 New worker added:", newWorker);
    
    return { success: true, worker: newWorker };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("workers")
    .insert({
      pin,
      full_name: fullName.trim(),
      role,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "This PIN is already in use." };
    }
    return { success: false, error: "Failed to create worker. Please try again." };
  }

  return { success: true, worker: data };
}

// ============================================
// Worker Listing (Manager)
// ============================================

export interface WorkerListItem {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  email?: string | null;
  phone?: string | null;
}

export async function getWorkers(): Promise<{ success: boolean; workers: WorkerListItem[]; error?: string }> {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  if (DEMO_MODE) {
    await delay(400);
    const DEMO_WORKERS = getDemoWorkers();
    const workers: WorkerListItem[] = DEMO_WORKERS.map((w) => ({
      id: w.id,
      full_name: w.full_name,
      role: w.role,
      is_active: true,
      created_at: new Date().toISOString(),
      email: null,
      phone: null,
    }));
    return { success: true, workers };
  }

  const { data, error } = await supabase!
    .from("workers")
    .select("id, full_name, role, is_active, created_at, email, phone")
    .order("full_name", { ascending: true });

  if (error) {
    return { success: false, workers: [], error: "Failed to load workers." };
  }

  return { success: true, workers: data || [] };
}

// ============================================
// Production Log Operations
// ============================================

export type ProductionEntry = {
  taskName: string;
  quantity: number;
};

export async function logProduction(workerId: string, entries: ProductionEntry[]) {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  // Filter out entries with 0 quantity
  const validEntries = entries.filter((e) => e.quantity > 0);

  if (validEntries.length === 0) {
    return { success: false, error: "No tasks to log. Please add quantities." };
  }

  // Demo mode
  if (DEMO_MODE) {
    await delay(800);
    console.log("📦 Demo production logged:", validEntries);
    return { 
      success: true, 
      logs: validEntries.map((e, i) => ({
        id: `demo-log-${i}`,
        worker_id: workerId,
        task_name: e.taskName,
        quantity: e.quantity,
        timestamp: new Date().toISOString(),
      }))
    };
  }

  // Supabase mode
  const insertData = validEntries.map((entry) => ({
    worker_id: workerId,
    task_name: entry.taskName,
    quantity: entry.quantity,
  }));

  const { data, error } = await supabase!
    .from("production_logs")
    .insert(insertData)
    .select();

  if (error) {
    return { success: false, error: "Failed to log production. Please try again." };
  }

  return { success: true, logs: data };
}
