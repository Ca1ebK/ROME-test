/**
 * Shared Supabase infrastructure
 * - Client creation
 * - Demo mode detection
 * - Demo data management
 * - Shared utilities
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================
// Demo Mode Detection
// ============================================

const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isDemoMode(): boolean {
  return DEMO_MODE;
}

// ============================================
// Supabase Client (only created if configured)
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: SupabaseClient<any> | null = null;

if (!DEMO_MODE) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseClient(): SupabaseClient<any> | null {
  return supabase;
}

// Log mode on startup
if (typeof window !== "undefined") {
  if (DEMO_MODE) {
    console.log("🎭 ROME running in DEMO MODE - no Supabase connection");
    console.log("📌 Test PINs: 123456, 234567, 345678, 456789, 567890");
    console.log("🔧 Admin PIN: 000000 (to add new workers)");
  } else {
    console.log("🚀 ROME connected to Supabase");
  }
}

// ============================================
// Demo Data
// ============================================

export interface DemoWorker {
  id: string;
  pin: string;
  full_name: string;
  role: string;
}

// Demo workers for testing without Supabase (mutable for adding new workers)
let DEMO_WORKERS: DemoWorker[] = [
  { id: "demo-1", pin: "123456", full_name: "John Smith", role: "worker" },
  { id: "demo-2", pin: "234567", full_name: "Maria Garcia", role: "worker" },
  { id: "demo-3", pin: "345678", full_name: "James Wilson", role: "supervisor" },
  { id: "demo-4", pin: "456789", full_name: "Sarah Johnson", role: "worker" },
  { id: "demo-5", pin: "567890", full_name: "Michael Brown", role: "worker" },
];

// Demo emails for testing
const DEMO_EMAILS: Record<string, string> = {
  "demo-1": "john.smith@example.com",
  "demo-2": "maria.garcia@example.com",
  "demo-3": "james.wilson@example.com",
  "demo-4": "sarah.johnson@example.com",
  "demo-5": "michael.brown@example.com",
};

// Demo phone numbers
const DEMO_PHONES: Record<string, string> = {
  "demo-1": "(555) 123-4567",
  "demo-2": "(555) 234-5678",
  "demo-3": "(555) 345-6789",
  "demo-4": "",
  "demo-5": "(555) 567-8901",
};

// Getters
export function getDemoWorkers(): DemoWorker[] {
  return DEMO_WORKERS;
}

export function getDemoEmails(): Record<string, string> {
  return DEMO_EMAILS;
}

export function getDemoPhones(): Record<string, string> {
  return DEMO_PHONES;
}

// Mutators
export function addDemoWorker(worker: DemoWorker): void {
  DEMO_WORKERS = [...DEMO_WORKERS, worker];
}

export function updateDemoEmail(workerId: string, email: string): void {
  DEMO_EMAILS[workerId] = email;
}

export function updateDemoPhone(workerId: string, phone: string): void {
  DEMO_PHONES[workerId] = phone;
}

// ============================================
// Shared Utilities
// ============================================

// Simulate network delay for realistic demo
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
