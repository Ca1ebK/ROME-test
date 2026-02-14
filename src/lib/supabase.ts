/**
 * Main Supabase module - Re-exports all functions for backwards compatibility
 * 
 * The codebase has been reorganized into:
 * - supabase-shared.ts: Shared infrastructure (client, demo mode, utilities)
 * - kiosk.ts: Kiosk-specific operations (clock in/out, production)
 * - dashboard.ts: Dashboard-specific operations (auth, profile, history)
 * - email.ts: Email service (Resend integration)
 * - timeoff.ts: Time-off request management
 * 
 * This file provides backwards compatibility by re-exporting all functions.
 */

// ============================================
// Re-export shared infrastructure
// ============================================
export { 
  isDemoMode, 
  getSupabaseClient, 
  delay,
  getDemoWorkers,
  getDemoEmails,
  getDemoPhones,
  type DemoWorker,
} from "./supabase-shared";

// ============================================
// Re-export kiosk functions
// ============================================
export { 
  authenticateWorker,
  getWorkerStatus,
  clockIn,
  clockOut,
  createWorker,
  getWorkers,
  logProduction,
  type ProductionEntry,
  type WorkerListItem,
} from "./kiosk";

// ============================================
// Re-export dashboard functions
// ============================================
export {
  authenticateWorkerForDashboard,
  sendVerificationCode,
  verifyCode,
  getPunchHistory,
  getWeeklyHours,
  getWorkerProfile,
  updateWorkerEmail,
  updateWorkerPhone,
  updateNotificationPreference,
  type PunchPair,
  type WorkerProfile,
} from "./dashboard";

// ============================================
// Re-export utilities from utils.ts
// ============================================
export { formatDuration } from "./utils";
