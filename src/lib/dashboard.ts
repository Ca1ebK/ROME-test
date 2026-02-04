/**
 * Dashboard-specific operations
 * - Worker authentication (PIN + email verification)
 * - Punch history & hours
 * - Profile management
 */

import { getSupabaseClient, isDemoMode, delay, getDemoWorkers, getDemoEmails, updateDemoEmail, getDemoPhones, updateDemoPhone } from "./supabase-shared";

// ============================================
// Demo State (Dashboard-specific)
// ============================================

// Demo verification codes (in-memory)
const demoVerificationCodes: Record<string, { code: string; expiresAt: Date }> = {};

// Demo notification preferences
const demoNotificationPrefs: Record<string, boolean> = {};

// ============================================
// Dashboard Authentication (PIN + Email)
// ============================================

export async function authenticateWorkerForDashboard(pin: string) {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  // Demo mode
  if (DEMO_MODE) {
    await delay(500);
    const DEMO_WORKERS = getDemoWorkers();
    const DEMO_EMAILS = getDemoEmails();
    const worker = DEMO_WORKERS.find((w) => w.pin === pin);
    if (!worker) {
      return { success: false, error: "Invalid PIN. Please try again." };
    }
    const email = DEMO_EMAILS[worker.id] || "test@example.com";
    return { 
      success: true, 
      worker: { 
        id: worker.id, 
        full_name: worker.full_name, 
        role: worker.role,
        email,
      },
    };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("workers")
    .select("id, full_name, role, email")
    .eq("pin", pin)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return { success: false, error: "Invalid PIN. Please try again." };
  }

  if (!data.email) {
    return { success: false, error: "No email registered. Please contact your manager." };
  }

  return { success: true, worker: data };
}

export async function sendVerificationCode(workerId: string, email: string, workerName?: string) {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();
  
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Helper to send email via API route (keeps Node.js modules server-side only)
  const sendEmailViaApi = async () => {
    try {
      const response = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, workerName: workerName || "Team Member" }),
      });
      return await response.json();
    } catch (err) {
      console.error("Failed to send email via API:", err);
      // Log code to console as fallback
      console.log(`📧 Verification code for ${email}: ${code}`);
      return { success: true };
    }
  };

  // Demo mode
  if (DEMO_MODE) {
    await delay(500);
    demoVerificationCodes[workerId] = { code, expiresAt };
    // Send email via API route
    await sendEmailViaApi();
    return { success: true, message: "Code sent!" };
  }

  // Supabase mode - store code in database
  const { error } = await supabase!
    .from("verification_codes")
    .insert({
      worker_id: workerId,
      code,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    return { success: false, error: "Failed to send code. Please try again." };
  }

  // Send email via API route
  const emailResult = await sendEmailViaApi();
  
  if (!emailResult.success) {
    console.error("Failed to send verification email:", emailResult.error);
  }

  return { success: true, message: "Code sent!" };
}

export async function verifyCode(workerId: string, code: string) {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  // Demo mode
  if (DEMO_MODE) {
    await delay(500);
    const stored = demoVerificationCodes[workerId];
    if (!stored) {
      return { success: false, error: "No code found. Please request a new one." };
    }
    if (stored.code !== code) {
      return { success: false, error: "Invalid code. Please try again." };
    }
    if (new Date() > stored.expiresAt) {
      return { success: false, error: "Code expired. Please request a new one." };
    }
    // Clear used code
    delete demoVerificationCodes[workerId];
    return { success: true };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("verification_codes")
    .select("*")
    .eq("worker_id", workerId)
    .eq("code", code)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return { success: false, error: "Invalid code. Please try again." };
  }

  if (new Date(data.expires_at) < new Date()) {
    return { success: false, error: "Code expired. Please request a new one." };
  }

  // Mark code as used
  await supabase!
    .from("verification_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { success: true };
}

// ============================================
// Punch History & Hours
// ============================================

export interface PunchPair {
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  totalMs: number;
}

export async function getPunchHistory(workerId: string, days: number = 14) {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Demo mode
  if (DEMO_MODE) {
    await delay(300);
    // Generate some fake punch history
    const history: PunchPair[] = [];
    for (let i = 1; i <= Math.min(days, 7); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
        const clockIn = new Date(date);
        clockIn.setHours(8, Math.floor(Math.random() * 15), 0, 0);
        const clockOut = new Date(date);
        clockOut.setHours(16, Math.floor(Math.random() * 45), 0, 0);
        history.push({
          date: date.toISOString().split("T")[0],
          clockIn: clockIn.toISOString(),
          clockOut: clockOut.toISOString(),
          totalMs: clockOut.getTime() - clockIn.getTime(),
        });
      }
    }
    return { success: true, history };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("punches")
    .select("*")
    .eq("worker_id", workerId)
    .gte("timestamp", startDate.toISOString())
    .order("timestamp", { ascending: true });

  if (error) {
    return { success: false, error: "Failed to load punch history." };
  }

  // Group punches into pairs by date
  const punchMap = new Map<string, { ins: string[]; outs: string[] }>();
  
  for (const punch of data || []) {
    const date = punch.timestamp.split("T")[0];
    if (!punchMap.has(date)) {
      punchMap.set(date, { ins: [], outs: [] });
    }
    const entry = punchMap.get(date)!;
    if (punch.type === "IN") {
      entry.ins.push(punch.timestamp);
    } else {
      entry.outs.push(punch.timestamp);
    }
  }

  const history: PunchPair[] = [];
  for (const [date, { ins, outs }] of punchMap) {
    const clockIn = ins[0] || null;
    const clockOut = outs[outs.length - 1] || null;
    let totalMs = 0;
    if (clockIn && clockOut) {
      totalMs = new Date(clockOut).getTime() - new Date(clockIn).getTime();
    }
    history.push({ date, clockIn, clockOut, totalMs });
  }

  // Sort by date descending
  history.sort((a, b) => b.date.localeCompare(a.date));

  return { success: true, history };
}

export async function getWeeklyHours(workerId: string) {
  // Get start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const result = await getPunchHistory(workerId, 7);
  
  if (!result.success || !result.history) {
    return { totalMs: 0, totalHours: 0, dailyHours: {} };
  }

  let totalMs = 0;
  const dailyHours: Record<string, number> = {};

  for (const punch of result.history) {
    const punchDate = new Date(punch.date);
    if (punchDate >= startOfWeek) {
      totalMs += punch.totalMs;
      const dayName = punchDate.toLocaleDateString("en-US", { weekday: "short" });
      dailyHours[dayName] = (dailyHours[dayName] || 0) + punch.totalMs / (1000 * 60 * 60);
    }
  }

  return {
    totalMs,
    totalHours: totalMs / (1000 * 60 * 60),
    dailyHours,
  };
}

// ============================================
// Profile Management
// ============================================

export interface WorkerProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  email_notifications_enabled: boolean;
}

export async function getWorkerProfile(workerId: string): Promise<{ success: boolean; profile?: WorkerProfile; error?: string }> {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  // Demo mode
  if (DEMO_MODE) {
    await delay(300);
    const DEMO_WORKERS = getDemoWorkers();
    const DEMO_EMAILS = getDemoEmails();
    const DEMO_PHONES = getDemoPhones();
    const worker = DEMO_WORKERS.find((w) => w.id === workerId);
    if (!worker) {
      return { success: false, error: "Worker not found" };
    }
    return {
      success: true,
      profile: {
        id: worker.id,
        full_name: worker.full_name,
        email: DEMO_EMAILS[worker.id] || null,
        phone: DEMO_PHONES[worker.id] || null,
        role: worker.role,
        email_notifications_enabled: demoNotificationPrefs[worker.id] ?? true,
      },
    };
  }

  // Supabase mode
  const { data, error } = await supabase!
    .from("workers")
    .select("id, full_name, email, phone, role, email_notifications_enabled")
    .eq("id", workerId)
    .single();

  if (error || !data) {
    return { success: false, error: "Failed to load profile" };
  }

  return {
    success: true,
    profile: {
      ...data,
      email_notifications_enabled: data.email_notifications_enabled ?? true,
    } as WorkerProfile,
  };
}

export async function updateWorkerEmail(workerId: string, newEmail: string): Promise<{ success: boolean; error?: string }> {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return { success: false, error: "Invalid email format" };
  }

  // Demo mode
  if (DEMO_MODE) {
    await delay(500);
    updateDemoEmail(workerId, newEmail);
    console.log(`📧 Updated email for ${workerId}: ${newEmail}`);
    return { success: true };
  }

  // Supabase mode
  const { error } = await supabase!
    .from("workers")
    .update({ email: newEmail, updated_at: new Date().toISOString() })
    .eq("id", workerId);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "This email is already in use" };
    }
    return { success: false, error: "Failed to update email" };
  }

  return { success: true };
}

export async function updateWorkerPhone(workerId: string, phone: string): Promise<{ success: boolean; error?: string }> {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  // Clean and validate phone
  const cleanPhone = phone.replace(/\D/g, "");
  if (phone && cleanPhone.length < 10) {
    return { success: false, error: "Invalid phone number" };
  }

  const formattedPhone = phone ? phone : null;

  // Demo mode
  if (DEMO_MODE) {
    await delay(500);
    updateDemoPhone(workerId, formattedPhone || "");
    console.log(`📞 Updated phone for ${workerId}: ${formattedPhone}`);
    return { success: true };
  }

  // Supabase mode
  const { error } = await supabase!
    .from("workers")
    .update({ phone: formattedPhone, updated_at: new Date().toISOString() })
    .eq("id", workerId);

  if (error) {
    return { success: false, error: "Failed to update phone" };
  }

  return { success: true };
}

export async function updateNotificationPreference(workerId: string, enabled: boolean): Promise<{ success: boolean; error?: string }> {
  const DEMO_MODE = isDemoMode();
  const supabase = getSupabaseClient();

  // Demo mode
  if (DEMO_MODE) {
    await delay(300);
    demoNotificationPrefs[workerId] = enabled;
    console.log(`🔔 Updated notification preference for ${workerId}: ${enabled}`);
    return { success: true };
  }

  // Supabase mode
  const { error } = await supabase!
    .from("workers")
    .update({ email_notifications_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("id", workerId);

  if (error) {
    return { success: false, error: "Failed to update notification preference" };
  }

  return { success: true };
}
