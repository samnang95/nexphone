"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import type { AdminUser, LoginCredentials } from "@/types/auth";
import { ROUTES } from "@/routes";

const DEFAULT_ADMIN_USER: AdminUser = {
  id: "usr-001",
  name: "System Admin",
  email: "admin@nexphone.io",
  role: "Super Administrator",
  department: "Global Infrastructure & Core Platform",
  lastLoginAt: new Date().toISOString(),
  twoFactorEnabled: true,
  apiKeyPreview: "nx_live_998a4...7d2e",
  phone: "+1 (555) 019-2834",
  timezone: "America/Los_Angeles (UTC-7)",
};

const STORAGE_KEY = "nexphone_admin_session";

const SERVER_SNAPSHOT = JSON.stringify({
  isAuthenticated: true,
  user: DEFAULT_ADMIN_USER,
});

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("storage", callback);
  window.addEventListener("nexphone_auth_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("nexphone_auth_change", callback);
  };
}

function getClientSnapshot(): string {
  if (typeof window === "undefined") {
    return SERVER_SNAPSHOT;
  }
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ?? SERVER_SNAPSHOT;
  } catch {
    return SERVER_SNAPSHOT;
  }
}

function getServerSnapshot(): string {
  return SERVER_SNAPSHOT;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<AdminUser>) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // useSyncExternalStore guarantees SSR and client initial hydration match 100%
  const rawSession = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const session = useMemo(() => {
    try {
      return JSON.parse(rawSession);
    } catch {
      return { isAuthenticated: true, user: DEFAULT_ADMIN_USER };
    }
  }, [rawSession]);

  const user: AdminUser | null = session.user;
  const isAuthenticated: boolean = Boolean(session.isAuthenticated);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);

      // Brief simulated verification
      await new Promise((resolve) => setTimeout(resolve, 400));

      const normalizedEmail = credentials.email.trim().toLowerCase();

      if (!normalizedEmail || !credentials.password) {
        setIsLoading(false);
        return { success: false, error: "Please enter both email and password." };
      }

      if (credentials.password.length < 6) {
        setIsLoading(false);
        return { success: false, error: "Password must be at least 6 characters." };
      }

      const updatedUser: AdminUser = {
        ...DEFAULT_ADMIN_USER,
        email: normalizedEmail,
        name: normalizedEmail.includes("admin")
          ? "System Admin"
          : (normalizedEmail.split("@")[0] ?? "Admin User"),
        lastLoginAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ isAuthenticated: true, user: updatedUser })
        );
        window.dispatchEvent(new Event("nexphone_auth_change"));
      } catch {
        // Storage fallback
      }

      setIsLoading(false);
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isAuthenticated: false, user: null })
      );
      window.dispatchEvent(new Event("nexphone_auth_change"));
    } catch {
      // Storage fallback
    }
    router.push(ROUTES.AUTH.LOGIN);
  }, [router]);

  const updateProfile = useCallback(async (updates: Partial<AdminUser>): Promise<boolean> => {
    try {
      const current = session.user ?? DEFAULT_ADMIN_USER;
      const merged = { ...current, ...updates };
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isAuthenticated: true, user: merged })
      );
      window.dispatchEvent(new Event("nexphone_auth_change"));
    } catch {
      // Storage fallback
    }
    return true;
  }, [session.user]);

  const requestPasswordReset = useCallback(async (email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      success: true,
      message: `Password reset instructions dispatched to ${email}`,
    };
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (newPassword) {
      // Acknowledged
    }
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateProfile,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
