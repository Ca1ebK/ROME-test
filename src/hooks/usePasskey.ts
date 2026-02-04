"use client";

import { useState, useCallback } from "react";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";

interface PasskeyCredentialInfo {
  id: string;
  credential_id: string;
  device_name: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface UsePasskeyReturn {
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  register: (workerId: string, userName: string, userEmail: string, deviceName?: string) => Promise<boolean>;
  authenticate: (workerId: string) => Promise<boolean>;
  getPasskeys: (workerId: string) => Promise<PasskeyCredentialInfo[]>;
  deletePasskey: (workerId: string, credentialId: string) => Promise<boolean>;
  hasPasskeys: (workerId: string) => Promise<boolean>;
  clearError: () => void;
}

export function usePasskey(): UsePasskeyReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if WebAuthn is supported
  const isSupported =
    typeof window !== "undefined" &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === "function";

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Register a new passkey
  const register = useCallback(
    async (workerId: string, userName: string, userEmail: string, deviceName?: string): Promise<boolean> => {
      if (!isSupported) {
        setError("Passkeys are not supported on this device");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get registration options from server
        const optionsRes = await fetch("/api/passkey/register-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId, userName, userEmail }),
        });

        const optionsData = await optionsRes.json();
        if (!optionsData.success) {
          throw new Error(optionsData.error || "Failed to get registration options");
        }

        const options: PublicKeyCredentialCreationOptionsJSON = optionsData.options;

        // Start WebAuthn registration (triggers biometric/PIN prompt)
        const registrationResponse = await startRegistration({ optionsJSON: options });

        // Verify with server and store credential
        const verifyRes = await fetch("/api/passkey/register-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workerId,
            response: registrationResponse,
            deviceName: deviceName || getDeviceName(),
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          throw new Error(verifyData.error || "Failed to verify registration");
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        // Handle user cancellation gracefully
        if (message.includes("cancelled") || message.includes("canceled") || message.includes("NotAllowedError")) {
          setError("Registration cancelled");
        } else {
          setError(message);
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported]
  );

  // Authenticate with a passkey
  const authenticate = useCallback(
    async (workerId: string): Promise<boolean> => {
      if (!isSupported) {
        setError("Passkeys are not supported on this device");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get authentication options from server
        const optionsRes = await fetch("/api/passkey/auth-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId }),
        });

        const optionsData = await optionsRes.json();
        if (!optionsData.success) {
          throw new Error(optionsData.error || "Failed to get authentication options");
        }

        const options: PublicKeyCredentialRequestOptionsJSON = optionsData.options;

        // Start WebAuthn authentication (triggers biometric/PIN prompt)
        const authResponse = await startAuthentication({ optionsJSON: options });

        // Verify with server
        const verifyRes = await fetch("/api/passkey/auth-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workerId,
            response: authResponse,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          throw new Error(verifyData.error || "Failed to verify authentication");
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        // Handle user cancellation gracefully
        if (message.includes("cancelled") || message.includes("canceled") || message.includes("NotAllowedError")) {
          setError("Authentication cancelled");
        } else {
          setError(message);
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isSupported]
  );

  // Get user's passkeys
  const getPasskeys = useCallback(async (workerId: string): Promise<PasskeyCredentialInfo[]> => {
    try {
      const res = await fetch(`/api/passkey/list?workerId=${workerId}`);
      const data = await res.json();
      if (data.success) {
        return data.passkeys;
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  // Check if user has passkeys
  const hasPasskeys = useCallback(async (workerId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/passkey/list?workerId=${workerId}`);
      const data = await res.json();
      return data.success && data.passkeys && data.passkeys.length > 0;
    } catch {
      return false;
    }
  }, []);

  // Delete a passkey
  const deletePasskey = useCallback(async (workerId: string, credentialId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/passkey/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, credentialId }),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }, []);

  return {
    isSupported,
    isLoading,
    error,
    register,
    authenticate,
    getPasskeys,
    deletePasskey,
    hasPasskeys,
    clearError,
  };
}

// Helper to get a friendly device name
function getDeviceName(): string {
  if (typeof navigator === "undefined") return "Unknown Device";

  const ua = navigator.userAgent;
  
  // iOS devices
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  
  // Android devices
  if (/Android/.test(ua)) {
    const match = ua.match(/Android.*?;\s*([^;)]+)/);
    if (match) return match[1].trim();
    return "Android Device";
  }
  
  // Desktop browsers
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Linux/.test(ua)) return "Linux PC";
  if (/CrOS/.test(ua)) return "Chromebook";
  
  return "Unknown Device";
}
