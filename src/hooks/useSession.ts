"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface Session {
  workerId: string;
  workerName: string;
  email?: string;
  role?: string;
  expiresAt: number;
}

interface UseSessionOptions {
  /** Required role(s) to access this page. Redirects to fallbackRoute if not matched */
  requiredRoles?: string[];
  /** Where to redirect if role check fails (default: /dashboard) */
  roleFailRedirect?: string;
  /** Where to redirect if not logged in (default: /login) */
  loginRedirect?: string;
}

interface UseSessionReturn {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

const SESSION_KEY = "rome_session";

/**
 * Hook for managing user session across the app.
 * Handles session validation, expiry, role checks, and logout.
 */
export function useSession(options: UseSessionOptions = {}): UseSessionReturn {
  const {
    requiredRoles,
    roleFailRedirect = "/dashboard",
    loginRedirect = "/login",
  } = options;

  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check and validate session on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);

    // No session - redirect to login
    if (!stored) {
      router.push(loginRedirect);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Session;

      // Session expired - clear and redirect
      if (parsed.expiresAt < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        router.push(loginRedirect);
        return;
      }

      // Role check if required
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = requiredRoles.includes(parsed.role || "");
        if (!hasRole) {
          router.push(roleFailRedirect);
          return;
        }
      }

      // Valid session
      setSession(parsed);
      setIsLoading(false);
    } catch {
      // Invalid session data - clear and redirect
      localStorage.removeItem(SESSION_KEY);
      router.push(loginRedirect);
    }
  }, [router, requiredRoles, roleFailRedirect, loginRedirect]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    router.push(loginRedirect);
  }, [router, loginRedirect]);

  return {
    session,
    isLoading,
    isAuthenticated: !!session,
    logout,
  };
}

/**
 * Store a new session in localStorage
 */
export function createSession(data: Omit<Session, "expiresAt">, expiryDays = 7): void {
  const session: Session = {
    ...data,
    expiresAt: Date.now() + expiryDays * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Get current session without validation (for quick checks)
 */
export function getStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as Session;
  } catch {
    return null;
  }
}
