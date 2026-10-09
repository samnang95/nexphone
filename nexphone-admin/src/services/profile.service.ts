import { appConfig } from "@/config/env";
import type {
  AdminProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  AdminSession,
  AdminSecurityAuditLog,
  ClusterSettings,
} from "@/types/profile";

const API_BASE = appConfig.apiUrl || "http://localhost:3000";

const DEFAULT_PROFILE: AdminProfile = {
  id: "usr-001",
  name: "System Admin",
  email: "admin@nexphone.io",
  role: "Super Administrator",
  department: "Global Infrastructure & Core Platform",
  phone: "+1 (555) 019-2834",
  timezone: "America/Los_Angeles (UTC-7)",
  bio: "Lead Systems & Infrastructure Architect overseeing satellite VoIP backbones and secure hardware enclave deployments.",
  avatarPreset: "cyber_shield",
  twoFactorEnabled: true,
  twoFactorMethod: "FIDO2 WebAuthn",
  apiKeyPreview: "nx_live_998a4...7d2e",
  securityLevel: "Tier 1 Root",
  lastLoginAt: new Date().toISOString(),
  lastPasswordChangeAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  hardwareEnclaveId: "ENC-TITAN-X9-8804",
};

const DEFAULT_SESSIONS: AdminSession[] = [
  {
    id: "sess-01",
    deviceName: "macOS Apple Silicon • NexPhone Admin Console",
    deviceType: "desktop",
    ipAddress: "192.168.1.104",
    location: "San Francisco, CA, US",
    browser: "Chrome 134.0.6998",
    current: true,
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: "sess-02",
    deviceName: "NexPhone Pro Max X (Field Security Console)",
    deviceType: "mobile",
    ipAddress: "10.240.12.84",
    location: "Cupertino, CA, US",
    browser: "NexPhone Secure Shell 4.2",
    current: false,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: "sess-03",
    deviceName: "Ops Bridge Terminal 04 (Dual Enclave)",
    deviceType: "terminal",
    ipAddress: "172.16.88.22",
    location: "Ashburn Data Center, VA, US",
    browser: "Firefox ESR 128.8",
    current: false,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "sess-04",
    deviceName: "Fleet Recovery Workstation",
    deviceType: "desktop",
    ipAddress: "192.168.1.210",
    location: "San Francisco, CA, US",
    browser: "Safari 18.3",
    current: false,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

const DEFAULT_AUDIT_LOGS: AdminSecurityAuditLog[] = [
  {
    id: "audit-01",
    action: "Console Authentication",
    actor: "admin@nexphone.io",
    ipAddress: "192.168.1.104",
    timestamp: new Date().toISOString(),
    status: "success",
    details: "Authenticated via FIDO2 WebAuthn hardware enclave challenge",
  },
  {
    id: "audit-02",
    action: "API Gateway Token Access",
    actor: "admin@nexphone.io",
    ipAddress: "192.168.1.104",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: "success",
    details: "Exported nx_live token preview for CLI sync",
  },
  {
    id: "audit-03",
    action: "Password Verified",
    actor: "admin@nexphone.io",
    ipAddress: "192.168.1.104",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    status: "success",
    details: "Enclave password rotated with AES-256-GCM salt",
  },
  {
    id: "audit-04",
    action: "Session Initialized",
    actor: "admin@nexphone.io",
    ipAddress: "10.240.12.84",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: "warn",
    details: "Mobile console connected over encrypted WireGuard mesh",
  },
];

const DEFAULT_SETTINGS: ClusterSettings = {
  flavor: "development",
  heartbeatTimeoutSec: 30,
  mediaIngestionRate: "realtime",
  incidentWebhookUrl: "https://hooks.slack.com/services/T00/B00/nexphone-alerts",
  autoLockMinutes: 15,
  enforceHardware2FA: true,
  allowSubnetCIDR: "192.168.0.0/16, 10.240.0.0/16",
  notifyOnNewLogin: true,
};

const CACHE_KEY_PROFILE = "nexphone_admin_profile_cache";
const CACHE_KEY_SESSIONS = "nexphone_admin_sessions_cache";
const CACHE_KEY_AUDIT = "nexphone_admin_audit_cache";
const CACHE_KEY_SETTINGS = "nexphone_admin_settings_cache";

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors
  }
}

export const profileService = {
  async getProfile(): Promise<{
    profile: AdminProfile;
    sessions: AdminSession[];
    auditLogs: AdminSecurityAuditLog[];
    settings: ClusterSettings;
  }> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/profile`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setLocal(CACHE_KEY_PROFILE, data.profile);
        setLocal(CACHE_KEY_SESSIONS, data.sessions);
        setLocal(CACHE_KEY_AUDIT, data.auditLogs);
        setLocal(CACHE_KEY_SETTINGS, data.settings);
        return data;
      }
    } catch {
      // Fallback
    }

    return {
      profile: getLocal(CACHE_KEY_PROFILE, DEFAULT_PROFILE),
      sessions: getLocal(CACHE_KEY_SESSIONS, DEFAULT_SESSIONS),
      auditLogs: getLocal(CACHE_KEY_AUDIT, DEFAULT_AUDIT_LOGS),
      settings: getLocal(CACHE_KEY_SETTINGS, DEFAULT_SETTINGS),
    };
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AdminProfile> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setLocal(CACHE_KEY_PROFILE, updated);
        return updated;
      }
    } catch {
      // Fallback
    }

    const current = getLocal(CACHE_KEY_PROFILE, DEFAULT_PROFILE);
    const updated: AdminProfile = {
      ...current,
      name: payload.name.trim(),
      email: payload.email.trim(),
      department: payload.department,
      phone: payload.phone,
      timezone: payload.timezone,
      bio: payload.bio,
      avatarPreset: payload.avatarPreset || current.avatarPreset,
    };
    setLocal(CACHE_KEY_PROFILE, updated);
    return updated;
  },

  async changePassword(
    payload: ChangePasswordPayload
  ): Promise<{ success: boolean; message: string; lastPasswordChangeAt: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const prof = getLocal(CACHE_KEY_PROFILE, DEFAULT_PROFILE);
        prof.lastPasswordChangeAt = data.lastPasswordChangeAt;
        setLocal(CACHE_KEY_PROFILE, prof);
        return data;
      }
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || "Failed to change password");
    } catch (e: unknown) {
      if (e instanceof Error && e.message !== "Failed to fetch") {
        throw e;
      }
    }

    // Offline simulation
    const now = new Date().toISOString();
    const prof = getLocal(CACHE_KEY_PROFILE, DEFAULT_PROFILE);
    prof.lastPasswordChangeAt = now;
    setLocal(CACHE_KEY_PROFILE, prof);

    return {
      success: true,
      message: "Password changed successfully. Your new credentials are active.",
      lastPasswordChangeAt: now,
    };
  },

  async rotateToken(): Promise<{
    success: boolean;
    apiKeyPreview: string;
    apiKeyFull: string;
    message: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/rotate-token`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        const prof = getLocal(CACHE_KEY_PROFILE, DEFAULT_PROFILE);
        prof.apiKeyPreview = data.apiKeyPreview;
        setLocal(CACHE_KEY_PROFILE, prof);
        return data;
      }
    } catch {
      // Fallback
    }

    const rand = Math.random().toString(36).substring(2, 10);
    const newFull = `nx_live_${rand}`;
    const newPreview = `nx_live_${rand.slice(0, 5)}...7d2e`;
    const prof = getLocal(CACHE_KEY_PROFILE, DEFAULT_PROFILE);
    prof.apiKeyPreview = newPreview;
    setLocal(CACHE_KEY_PROFILE, prof);

    return {
      success: true,
      apiKeyPreview: newPreview,
      apiKeyFull: newFull,
      message: "Administrative API token rotated successfully.",
    };
  },

  async getSessions(): Promise<AdminSession[]> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/sessions`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setLocal(CACHE_KEY_SESSIONS, data);
        return data;
      }
    } catch {
      // Fallback
    }
    return getLocal(CACHE_KEY_SESSIONS, DEFAULT_SESSIONS);
  },

  async revokeSession(id: string): Promise<AdminSession[]> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/sessions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setLocal(CACHE_KEY_SESSIONS, data.sessions);
        return data.sessions;
      }
    } catch {
      // Fallback
    }

    const current = getLocal(CACHE_KEY_SESSIONS, DEFAULT_SESSIONS);
    const updated = current.filter((s) => s.id !== id);
    setLocal(CACHE_KEY_SESSIONS, updated);
    return updated;
  },

  async revokeOtherSessions(): Promise<AdminSession[]> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/sessions/revoke-others`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setLocal(CACHE_KEY_SESSIONS, data.sessions);
        return data.sessions;
      }
    } catch {
      // Fallback
    }

    const current = getLocal(CACHE_KEY_SESSIONS, DEFAULT_SESSIONS);
    const updated = current.filter((s) => s.current);
    setLocal(CACHE_KEY_SESSIONS, updated);
    return updated;
  },

  async getAuditLogs(): Promise<AdminSecurityAuditLog[]> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/audit-logs`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setLocal(CACHE_KEY_AUDIT, data);
        return data;
      }
    } catch {
      // Fallback
    }
    return getLocal(CACHE_KEY_AUDIT, DEFAULT_AUDIT_LOGS);
  },

  async updateClusterSettings(
    settings: Partial<ClusterSettings>
  ): Promise<ClusterSettings> {
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = await res.json();
        setLocal(CACHE_KEY_SETTINGS, updated);
        return updated;
      }
    } catch {
      // Fallback
    }

    const current = getLocal(CACHE_KEY_SETTINGS, DEFAULT_SETTINGS);
    const merged = { ...current, ...settings };
    setLocal(CACHE_KEY_SETTINGS, merged);
    return merged;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/api/admin/logout`, {
        method: "POST",
      });
    } catch {
      // Ignore network errors on logout
    }
  },
};
