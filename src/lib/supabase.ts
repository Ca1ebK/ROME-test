import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ============================================
// Demo Mode - Works without Supabase
// ============================================

const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Demo workers for testing without Supabase
const DEMO_WORKERS = [
  { id: "demo-1", pin: "123456", full_name: "John Smith", role: "worker" },
  { id: "demo-2", pin: "234567", full_name: "Maria Garcia", role: "worker" },
  { id: "demo-3", pin: "345678", full_name: "James Wilson", role: "supervisor" },
  { id: "demo-4", pin: "456789", full_name: "Sarah Johnson", role: "worker" },
  { id: "demo-5", pin: "567890", full_name: "Michael Brown", role: "worker" },
];

// Track demo state in memory
const demoState: Record<string, { isClockedIn: boolean }> = {};

// Simulate network delay for realistic demo
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// Supabase Client (only created if configured)
// ============================================

let supabase: SupabaseClient<Database> | null = null;

if (!DEMO_MODE) {
  supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Log mode on startup
if (typeof window !== "undefined") {
  if (DEMO_MODE) {
    console.log("🎭 ROME running in DEMO MODE - no Supabase connection");
    console.log("📌 Test PINs: 123456, 234567, 345678, 456789, 567890");
  } else {
    console.log("🚀 ROME connected to Supabase");
  }
}

// ============================================
// Worker Operations
// ============================================

export async function authenticateWorker(pin: string) {
  // Demo mode
  if (DEMO_MODE) {
    await delay(500); // Simulate network
    const worker = DEMO_WORKERS.find((w) => w.pin === pin);
    if (!worker) {
      return { success: false, error: "Invalid PIN. Please try again." };
    }
    return { 
      success: true, 
      worker: { id: worker.id, full_name: worker.full_name, role: worker.role } 
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

  return { success: true, worker: data };
}

export async function getWorkerStatus(workerId: string) {
  // Demo mode
  if (DEMO_MODE) {
    await delay(200);
    return { 
      isClockedIn: demoState[workerId]?.isClockedIn ?? false, 
      lastPunch: null 
    };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("punches")
    .select("type, timestamp")
    .eq("worker_id", workerId)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return { isClockedIn: false, lastPunch: null };
  }

  return {
    isClockedIn: data.type === "IN",
    lastPunch: data,
  };
}

// ============================================
// Punch Operations
// ============================================

export async function clockIn(workerId: string) {
  // Demo mode
  if (DEMO_MODE) {
    await delay(600);
    demoState[workerId] = { isClockedIn: true };
    return { 
      success: true, 
      punch: { id: "demo-punch", worker_id: workerId, type: "IN" as const, timestamp: new Date().toISOString() } 
    };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("punches")
    .insert({
      worker_id: workerId,
      type: "IN",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Failed to clock in. Please try again." };
  }

  return { success: true, punch: data };
}

export async function clockOut(workerId: string) {
  // Demo mode
  if (DEMO_MODE) {
    await delay(600);
    demoState[workerId] = { isClockedIn: false };
    return { 
      success: true, 
      punch: { id: "demo-punch", worker_id: workerId, type: "OUT" as const, timestamp: new Date().toISOString() } 
    };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("punches")
    .insert({
      worker_id: workerId,
      type: "OUT",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Failed to clock out. Please try again." };
  }

  return { success: true, punch: data };
}

// ============================================
// Production Log Operations
// ============================================

export type ProductionEntry = {
  taskName: string;
  quantity: number;
};

export async function logProduction(workerId: string, entries: ProductionEntry[]) {
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
