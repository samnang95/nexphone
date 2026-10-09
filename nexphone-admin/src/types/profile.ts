export type AdminRole =
  | "Super Administrator"
  | "Security Lead"
  | "DevOps Engineer"
  | "Fleet Operator";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  department: string;
  phone: string;
  timezone: string;
  bio?: string;
  avatarUrl?: string;
  avatarPreset?: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: "FIDO2 WebAuthn" | "Authenticator App (TOTP)" | "SMS OTP";
  apiKeyPreview: string;
  securityLevel: "Tier 1 Root" | "Tier 2 Operator" | "Tier 3 Auditor";
  lastLoginAt: string;
  lastPasswordChangeAt: string;
  hardwareEnclaveId: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  department: string;
  phone: string;
  timezone: string;
  bio?: string;
  avatarPreset?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminSession {
  id: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "terminal";
  ipAddress: string;
  location: string;
  browser: string;
  current: boolean;
  lastActiveAt: string;
}

export interface AdminSecurityAuditLog {
  id: string;
  action: string;
  actor: string;
  ipAddress: string;
  timestamp: string;
  status: "success" | "warn" | "danger";
  details: string;
}

export interface ClusterSettings {
  flavor: "development" | "staging" | "production";
  heartbeatTimeoutSec: number;
  mediaIngestionRate: "realtime" | "5s" | "30s";
  incidentWebhookUrl: string;
  autoLockMinutes: number;
  enforceHardware2FA: boolean;
  allowSubnetCIDR: string;
  notifyOnNewLogin: boolean;
}

export type ProfileTab = "overview" | "security" | "sessions" | "settings";
