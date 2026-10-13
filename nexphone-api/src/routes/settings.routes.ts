import { Router, type Request, type Response } from "express";

export const settingsRouter = Router();

// ==========================================
// Admin Profile, Password & Settings APIs
// ==========================================

export interface AdminProfileRecord {
  id: string;
  name: string;
  email: string;
  role: "Super Administrator" | "Security Lead" | "DevOps Engineer" | "Fleet Operator";
  department: string;
  phone: string;
  timezone: string;
  bio: string;
  avatarUrl?: string;
  avatarPreset?: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: "FIDO2 WebAuthn" | "Authenticator App (TOTP)" | "SMS OTP";
  apiKeyPreview: string;
  apiKeyFull: string;
  securityLevel: "Tier 1 Root" | "Tier 2 Operator" | "Tier 3 Auditor";
  lastLoginAt: string;
  lastPasswordChangeAt: string;
  hardwareEnclaveId: string;
}

export interface AdminSessionRecord {
  id: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "terminal";
  ipAddress: string;
  location: string;
  browser: string;
  current: boolean;
  lastActiveAt: string;
}

export interface AdminSecurityAuditRecord {
  id: string;
  action: string;
  actor: string;
  ipAddress: string;
  timestamp: string;
  status: "success" | "warn" | "danger";
  details: string;
}

export interface ClusterSettingsRecord {
  flavor: "development" | "staging" | "production";
  heartbeatTimeoutSec: number;
  mediaIngestionRate: "realtime" | "5s" | "30s";
  incidentWebhookUrl: string;
  autoLockMinutes: number;
  enforceHardware2FA: boolean;
  allowSubnetCIDR: string;
  notifyOnNewLogin: boolean;
}

export let adminProfileStore: AdminProfileRecord = {
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
  apiKeyFull: "nx_live_998a4bc7102e88a01174d82f7d2e",
  securityLevel: "Tier 1 Root",
  lastLoginAt: new Date().toISOString(),
  lastPasswordChangeAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  hardwareEnclaveId: "ENC-TITAN-X9-8804",
};

export let adminSessionsStore: AdminSessionRecord[] = [
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

export let adminAuditLogsStore: AdminSecurityAuditRecord[] = [
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

export let clusterSettingsStore: ClusterSettingsRecord = {
  flavor: "development",
  heartbeatTimeoutSec: 30,
  mediaIngestionRate: "realtime",
  incidentWebhookUrl: "https://hooks.slack.com/services/T00/B00/nexphone-alerts",
  autoLockMinutes: 15,
  enforceHardware2FA: true,
  allowSubnetCIDR: "192.168.0.0/16, 10.240.0.0/16",
  notifyOnNewLogin: true,
};

// GET /api/admin/profile
settingsRouter.get("/api/admin/profile", (_req: Request, res: Response) => {
  res.json({
    profile: adminProfileStore,
    sessions: adminSessionsStore,
    auditLogs: adminAuditLogsStore,
    settings: clusterSettingsStore,
  });
});

// PUT /api/admin/profile
settingsRouter.put("/api/admin/profile", (req: Request, res: Response) => {
  const body = req.body || {};
  if (!body.name || !body.email) {
    res.status(400).json({ error: "Name and email are required fields." });
    return;
  }

  adminProfileStore = {
    ...adminProfileStore,
    name: String(body.name).trim(),
    email: String(body.email).trim().toLowerCase(),
    department: body.department ? String(body.department).trim() : adminProfileStore.department,
    phone: body.phone ? String(body.phone).trim() : adminProfileStore.phone,
    timezone: body.timezone ? String(body.timezone).trim() : adminProfileStore.timezone,
    bio: body.bio !== undefined ? String(body.bio).trim() : adminProfileStore.bio,
    avatarPreset: body.avatarPreset || adminProfileStore.avatarPreset,
    avatarUrl: body.avatarUrl || adminProfileStore.avatarUrl,
  };

  // Add audit log
  adminAuditLogsStore.unshift({
    id: `audit-${Date.now().toString(36)}`,
    action: "Profile Updated",
    actor: adminProfileStore.email,
    ipAddress: "192.168.1.104",
    timestamp: new Date().toISOString(),
    status: "success",
    details: `Updated administrative identity attributes for ${adminProfileStore.name}`,
  });

  res.json(adminProfileStore);
});

// POST /api/admin/change-password
settingsRouter.post("/api/admin/change-password", (req: Request, res: Response) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};

  if (!currentPassword) {
    res.status(400).json({ error: "Current password is required to authorize change." });
    return;
  }

  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters long." });
    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: "New password and confirmation do not match." });
    return;
  }

  const now = new Date().toISOString();
  adminProfileStore = {
    ...adminProfileStore,
    lastPasswordChangeAt: now,
  };

  // Record audit log
  adminAuditLogsStore.unshift({
    id: `audit-${Date.now().toString(36)}`,
    action: "Password Changed",
    actor: adminProfileStore.email,
    ipAddress: "192.168.1.104",
    timestamp: now,
    status: "success",
    details: "Administrative enclave master password changed and re-salted with Argon2id",
  });

  res.json({
    success: true,
    message: "Password changed successfully. Your new cryptographic credentials are active.",
    lastPasswordChangeAt: now,
  });
});

// POST /api/admin/rotate-token
settingsRouter.post("/api/admin/rotate-token", (_req: Request, res: Response) => {
  const randomSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);
  const newFull = `nx_live_${randomSuffix}`;
  const newPreview = `nx_live_${randomSuffix.slice(0, 5)}...${randomSuffix.slice(-4)}`;

  adminProfileStore = {
    ...adminProfileStore,
    apiKeyFull: newFull,
    apiKeyPreview: newPreview,
  };

  adminAuditLogsStore.unshift({
    id: `audit-${Date.now().toString(36)}`,
    action: "API Token Rotated",
    actor: adminProfileStore.email,
    ipAddress: "192.168.1.104",
    timestamp: new Date().toISOString(),
    status: "warn",
    details: "Rotated master administrative API gateway token",
  });

  res.json({
    success: true,
    apiKeyPreview: newPreview,
    apiKeyFull: newFull,
    message: "Administrative API token rotated successfully.",
  });
});

// GET /api/admin/sessions
settingsRouter.get("/api/admin/sessions", (_req: Request, res: Response) => {
  res.json(adminSessionsStore);
});

// DELETE /api/admin/sessions/:id
settingsRouter.delete("/api/admin/sessions/:id", (req: Request, res: Response) => {
  const id = String(req.params.id);
  const index = adminSessionsStore.findIndex((s) => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  const [removed] = adminSessionsStore.splice(index, 1);
  if (!removed) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  adminAuditLogsStore.unshift({
    id: `audit-${Date.now().toString(36)}`,
    action: "Session Revoked",
    actor: adminProfileStore.email,
    ipAddress: "192.168.1.104",
    timestamp: new Date().toISOString(),
    status: "warn",
    details: `Revoked session ${removed.deviceName} (${removed.ipAddress})`,
  });

  res.json({ success: true, message: `Session ${removed.deviceName} terminated.`, sessions: adminSessionsStore });
});

// POST /api/admin/sessions/revoke-others
settingsRouter.post("/api/admin/sessions/revoke-others", (_req: Request, res: Response) => {
  adminSessionsStore = adminSessionsStore.filter((s) => s.current);

  adminAuditLogsStore.unshift({
    id: `audit-${Date.now().toString(36)}`,
    action: "All Other Sessions Revoked",
    actor: adminProfileStore.email,
    ipAddress: "192.168.1.104",
    timestamp: new Date().toISOString(),
    status: "warn",
    details: "Terminated all active administrative sessions except current device",
  });

  res.json({ success: true, message: "All other sessions revoked successfully.", sessions: adminSessionsStore });
});

// GET /api/admin/audit-logs
settingsRouter.get("/api/admin/audit-logs", (_req: Request, res: Response) => {
  res.json(adminAuditLogsStore);
});

// GET /api/admin/settings
settingsRouter.get("/api/admin/settings", (_req: Request, res: Response) => {
  res.json(clusterSettingsStore);
});

// PUT /api/admin/settings
settingsRouter.put("/api/admin/settings", (req: Request, res: Response) => {
  const body = req.body || {};
  clusterSettingsStore = {
    ...clusterSettingsStore,
    heartbeatTimeoutSec: body.heartbeatTimeoutSec !== undefined ? Number(body.heartbeatTimeoutSec) : clusterSettingsStore.heartbeatTimeoutSec,
    mediaIngestionRate: body.mediaIngestionRate || clusterSettingsStore.mediaIngestionRate,
    incidentWebhookUrl: body.incidentWebhookUrl !== undefined ? String(body.incidentWebhookUrl).trim() : clusterSettingsStore.incidentWebhookUrl,
    autoLockMinutes: body.autoLockMinutes !== undefined ? Number(body.autoLockMinutes) : clusterSettingsStore.autoLockMinutes,
    enforceHardware2FA: body.enforceHardware2FA !== undefined ? Boolean(body.enforceHardware2FA) : clusterSettingsStore.enforceHardware2FA,
    allowSubnetCIDR: body.allowSubnetCIDR !== undefined ? String(body.allowSubnetCIDR).trim() : clusterSettingsStore.allowSubnetCIDR,
    notifyOnNewLogin: body.notifyOnNewLogin !== undefined ? Boolean(body.notifyOnNewLogin) : clusterSettingsStore.notifyOnNewLogin,
  };

  adminAuditLogsStore.unshift({
    id: `audit-${Date.now().toString(36)}`,
    action: "Cluster Settings Updated",
    actor: adminProfileStore.email,
    ipAddress: "192.168.1.104",
    timestamp: new Date().toISOString(),
    status: "warn",
    details: "Updated cluster gateway preferences and security policy parameters",
  });

  res.json(clusterSettingsStore);
});

// POST /api/admin/logout
settingsRouter.post("/api/admin/logout", (_req: Request, res: Response) => {
  adminAuditLogsStore.unshift({
    id: `audit-${Date.now().toString(36)}`,
    action: "Admin Sign Out",
    actor: adminProfileStore.email,
    ipAddress: "192.168.1.104",
    timestamp: new Date().toISOString(),
    status: "success",
    details: "Administrative session signed out and security tokens revoked",
  });

  res.json({ success: true, message: "Logged out successfully" });
});
