import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/types";
import { getSupabaseClient, isDemoMode } from "./supabase-shared";
import type { PasskeyCredential } from "@/types/database";

// WebAuthn Relying Party configuration
const rpName = "ROME Warehouse";
const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const origin = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

// In-memory challenge store with TTL (5 minutes)
const challengeStore = new Map<string, { challenge: string; expiresAt: number }>();

// Demo mode passkey storage
const demoPasskeys: PasskeyCredential[] = [];

// Helper to clean expired challenges
function cleanExpiredChallenges() {
  const now = Date.now();
  for (const [key, value] of challengeStore.entries()) {
    if (value.expiresAt < now) {
      challengeStore.delete(key);
    }
  }
}

// Store a challenge for a user
function storeChallenge(workerId: string, challenge: string) {
  cleanExpiredChallenges();
  challengeStore.set(workerId, {
    challenge,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
}

// Get and consume a challenge
function getChallenge(workerId: string): string | null {
  const entry = challengeStore.get(workerId);
  if (!entry || entry.expiresAt < Date.now()) {
    challengeStore.delete(workerId);
    return null;
  }
  challengeStore.delete(workerId); // Consume the challenge
  return entry.challenge;
}

// Get user's passkeys from database
export async function getUserPasskeys(workerId: string): Promise<PasskeyCredential[]> {
  if (isDemoMode()) {
    return demoPasskeys.filter((p) => p.worker_id === workerId);
  }

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("passkey_credentials")
    .select("*")
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching passkeys:", error);
    return [];
  }

  return data || [];
}

// Check if user has any passkeys
export async function hasPasskeys(workerId: string): Promise<boolean> {
  const passkeys = await getUserPasskeys(workerId);
  return passkeys.length > 0;
}

// Generate registration options
export async function createRegistrationOptions(
  workerId: string,
  userName: string,
  userEmail: string
) {
  // Get existing credentials to exclude
  const existingPasskeys = await getUserPasskeys(workerId);
  const excludeCredentials = existingPasskeys.map((passkey) => ({
    id: passkey.credential_id,
    transports: (passkey.transports || []) as AuthenticatorTransportFuture[],
  }));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: userEmail || userName,
    userDisplayName: userName,
    attestationType: "none",
    excludeCredentials,
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
  });

  // Store the challenge
  storeChallenge(workerId, options.challenge);

  return options;
}

// Verify registration response and store credential
export async function verifyAndStoreRegistration(
  workerId: string,
  response: RegistrationResponseJSON,
  deviceName?: string
): Promise<{ success: boolean; error?: string }> {
  const expectedChallenge = getChallenge(workerId);
  if (!expectedChallenge) {
    return { success: false, error: "Challenge expired or not found" };
  }

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error) {
    console.error("Registration verification failed:", error);
    return { success: false, error: "Verification failed" };
  }

  if (!verification.verified || !verification.registrationInfo) {
    return { success: false, error: "Registration not verified" };
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  // Store the credential
  const newCredential: Omit<PasskeyCredential, "id"> = {
    worker_id: workerId,
    credential_id: credential.id,
    public_key: Buffer.from(credential.publicKey).toString("base64"),
    counter: credential.counter,
    device_name: deviceName || `${credentialDeviceType}${credentialBackedUp ? " (synced)" : ""}`,
    transports: response.response.transports || null,
    last_used_at: null,
    created_at: new Date().toISOString(),
  };

  if (isDemoMode()) {
    demoPasskeys.push({
      id: crypto.randomUUID(),
      ...newCredential,
    });
    return { success: true };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Database not available" };
  }

  const { error } = await supabase.from("passkey_credentials").insert(newCredential);

  if (error) {
    console.error("Error storing passkey:", error);
    return { success: false, error: "Failed to store passkey" };
  }

  return { success: true };
}

// Generate authentication options
export async function createAuthenticationOptions(workerId: string) {
  const userPasskeys = await getUserPasskeys(workerId);

  if (userPasskeys.length === 0) {
    return { success: false, error: "No passkeys registered" };
  }

  const allowCredentials = userPasskeys.map((passkey) => ({
    id: passkey.credential_id,
    transports: (passkey.transports || []) as AuthenticatorTransportFuture[],
  }));

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: "preferred",
  });

  // Store the challenge
  storeChallenge(workerId, options.challenge);

  return { success: true, options };
}

// Verify authentication response
export async function verifyAuthentication(
  workerId: string,
  response: AuthenticationResponseJSON
): Promise<{ success: boolean; error?: string }> {
  const expectedChallenge = getChallenge(workerId);
  if (!expectedChallenge) {
    return { success: false, error: "Challenge expired or not found" };
  }

  // Find the credential used
  const userPasskeys = await getUserPasskeys(workerId);
  const credential = userPasskeys.find((p) => p.credential_id === response.id);

  if (!credential) {
    return { success: false, error: "Credential not found" };
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credential.credential_id,
        publicKey: new Uint8Array(Buffer.from(credential.public_key, "base64")),
        counter: credential.counter,
        transports: (credential.transports || []) as AuthenticatorTransportFuture[],
      },
    });
  } catch (error) {
    console.error("Authentication verification failed:", error);
    return { success: false, error: "Verification failed" };
  }

  if (!verification.verified) {
    return { success: false, error: "Authentication not verified" };
  }

  // Update the counter and last used timestamp
  const newCounter = verification.authenticationInfo.newCounter;

  if (isDemoMode()) {
    const idx = demoPasskeys.findIndex((p) => p.credential_id === credential.credential_id);
    if (idx !== -1) {
      demoPasskeys[idx].counter = newCounter;
      demoPasskeys[idx].last_used_at = new Date().toISOString();
    }
    return { success: true };
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase
      .from("passkey_credentials")
      .update({
        counter: newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", credential.id);
  }

  return { success: true };
}

// Delete a passkey
export async function deletePasskey(
  workerId: string,
  credentialId: string
): Promise<{ success: boolean; error?: string }> {
  if (isDemoMode()) {
    const idx = demoPasskeys.findIndex(
      (p) => p.worker_id === workerId && p.credential_id === credentialId
    );
    if (idx !== -1) {
      demoPasskeys.splice(idx, 1);
      return { success: true };
    }
    return { success: false, error: "Passkey not found" };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Database not available" };
  }

  const { error } = await supabase
    .from("passkey_credentials")
    .delete()
    .eq("worker_id", workerId)
    .eq("credential_id", credentialId);

  if (error) {
    console.error("Error deleting passkey:", error);
    return { success: false, error: "Failed to delete passkey" };
  }

  return { success: true };
}
