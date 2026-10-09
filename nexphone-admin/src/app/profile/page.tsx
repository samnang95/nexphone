"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/profile.service";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileOverviewCard } from "@/components/profile/ProfileOverviewCard";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { LogoutConfirmationModal } from "@/components/profile/LogoutConfirmationModal";
import { ActiveSessionsManager } from "@/components/profile/ActiveSessionsManager";
import { SecurityAuditTrail } from "@/components/profile/SecurityAuditTrail";
import { ClusterSettingsForm } from "@/components/profile/ClusterSettingsForm";
import type {
  AdminProfile,
  ProfileTab,
  UpdateProfilePayload,
  ChangePasswordPayload,
  AdminSession,
  AdminSecurityAuditLog,
  ClusterSettings,
} from "@/types/profile";

const FALLBACK_LAST_PASSWORD_CHANGE_AT = "2026-09-25T08:00:00.000Z";
const FALLBACK_LAST_LOGIN_AT = "2026-10-09T08:00:00.000Z";

export default function ProfilePage() {
  const { user, updateProfile: updateAuthProfile, logout: authLogout } = useAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [profile, setProfile] = useState<AdminProfile>({
    id: user?.id || "usr-001",
    name: user?.name || "System Admin",
    email: user?.email || "admin@nexphone.io",
    role: "Super Administrator",
    department: user?.department || "Global Infrastructure & Core Platform",
    phone: user?.phone || "+1 (555) 019-2834",
    timezone: user?.timezone || "America/Los_Angeles (UTC-7)",
    bio: "Lead Systems & Infrastructure Architect overseeing satellite VoIP backbones and secure hardware enclave deployments.",
    avatarPreset: "cyber_shield",
    twoFactorEnabled: true,
    twoFactorMethod: "FIDO2 WebAuthn",
    apiKeyPreview: user?.apiKeyPreview || "nx_live_998a4...7d2e",
    securityLevel: "Tier 1 Root",
    lastLoginAt: user?.lastLoginAt || FALLBACK_LAST_LOGIN_AT,
    lastPasswordChangeAt: FALLBACK_LAST_PASSWORD_CHANGE_AT,
    hardwareEnclaveId: "ENC-TITAN-X9-8804",
  });

  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminSecurityAuditLog[]>([]);
  const [settings, setSettings] = useState<ClusterSettings>({
    flavor: "development",
    heartbeatTimeoutSec: 30,
    mediaIngestionRate: "realtime",
    incidentWebhookUrl: "https://hooks.slack.com/services/T00/B00/nexphone-alerts",
    autoLockMinutes: 15,
    enforceHardware2FA: true,
    allowSubnetCIDR: "192.168.0.0/16, 10.240.0.0/16",
    notifyOnNewLogin: true,
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isRotatingToken, setIsRotatingToken] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    variant: "success" | "warn" | "error";
  } | null>(null);

  const showToast = useCallback(
    (text: string, variant: "success" | "warn" | "error" = "success") => {
      setToastMessage({ text, variant });
      setTimeout(() => setToastMessage(null), 3500);
    },
    []
  );

  // Fetch initial profile & security state
  useEffect(() => {
    let isMounted = true;
    profileService.getProfile().then((data) => {
      if (!isMounted) return;
      setProfile((prev) => ({
        ...prev,
        ...data.profile,
        name: user?.name || data.profile.name,
        email: user?.email || data.profile.email,
      }));
      setSessions(data.sessions);
      setAuditLogs(data.auditLogs);
      setSettings(data.settings);
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Edit profile handler
  const handleSaveProfile = async (payload: UpdateProfilePayload) => {
    const updated = await profileService.updateProfile(payload);
    setProfile(updated);
    await updateAuthProfile({
      name: updated.name,
      email: updated.email,
      department: updated.department,
      phone: updated.phone,
      timezone: updated.timezone,
    });
    showToast("Profile identity attributes updated successfully.");
  };

  // Change password handler
  const handleChangePassword = async (payload: ChangePasswordPayload) => {
    const res = await profileService.changePassword(payload);
    setProfile((prev) => ({
      ...prev,
      lastPasswordChangeAt: res.lastPasswordChangeAt,
    }));
    // Refresh audit logs
    const refreshedLogs = await profileService.getAuditLogs();
    setAuditLogs(refreshedLogs);
    showToast(res.message);
  };

  // Rotate token handler
  const handleRotateToken = async () => {
    try {
      setIsRotatingToken(true);
      const res = await profileService.rotateToken();
      setProfile((prev) => ({
        ...prev,
        apiKeyPreview: res.apiKeyPreview,
      }));
      const refreshedLogs = await profileService.getAuditLogs();
      setAuditLogs(refreshedLogs);
      showToast("Administrative API token rotated successfully.");
    } finally {
      setIsRotatingToken(false);
    }
  };

  // Revoke single session
  const handleRevokeSession = async (id: string) => {
    const updatedSessions = await profileService.revokeSession(id);
    setSessions(updatedSessions);
    const refreshedLogs = await profileService.getAuditLogs();
    setAuditLogs(refreshedLogs);
    showToast("Remote terminal session revoked.", "warn");
  };

  // Revoke other sessions
  const handleRevokeOthers = async () => {
    const updatedSessions = await profileService.revokeOtherSessions();
    setSessions(updatedSessions);
    const refreshedLogs = await profileService.getAuditLogs();
    setAuditLogs(refreshedLogs);
    showToast("All other remote stations have been disconnected.", "warn");
  };

  // Logout handler
  const handleConfirmLogout = async (revokeOtherSessions: boolean) => {
    if (revokeOtherSessions) {
      await profileService.revokeOtherSessions();
    }
    await profileService.logout();
    setLogoutModalOpen(false);
    authLogout();
  };

  // Save cluster settings
  const handleSaveSettings = async (updatedSettings: Partial<ClusterSettings>) => {
    const res = await profileService.updateClusterSettings(updatedSettings);
    setSettings(res);
    const refreshedLogs = await profileService.getAuditLogs();
    setAuditLogs(refreshedLogs);
    showToast("Cluster settings and policies updated.");
  };

  const remoteSessionsCount = sessions.filter((s) => !s.current).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header with Sub-tabs and CTAs */}
      <ProfileHeader
        profile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onEditProfile={() => setEditModalOpen(true)}
        onChangePassword={() => setPasswordModalOpen(true)}
        onLogout={() => setLogoutModalOpen(true)}
        sessionsCount={sessions.length}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.variant === "success"
              ? "border-emerald-500/40 bg-emerald-950/80 text-emerald-300"
              : toastMessage.variant === "warn"
              ? "border-amber-500/40 bg-amber-950/80 text-amber-300"
              : "border-rose-500/40 bg-rose-950/80 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>
              {toastMessage.variant === "success"
                ? "✓"
                : toastMessage.variant === "warn"
                ? "⚠"
                : "✕"}
            </span>
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Tab View */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <ProfileOverviewCard
            profile={profile}
            onEditProfile={() => setEditModalOpen(true)}
            onChangePassword={() => setPasswordModalOpen(true)}
            onRotateToken={handleRotateToken}
            isRotatingToken={isRotatingToken}
            activeSessionsCount={sessions.length}
          />
          <SecurityAuditTrail logs={auditLogs.slice(0, 5)} />
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Password Credentials Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-lg space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Password & Enclave Master</h3>
                  <p className="text-xs text-slate-400">Argon2id Master Authorization</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Password Status:</span>
                  <span className="text-emerald-400 font-semibold">Active & Healthy</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Last Changed:</span>
                  <span className="text-slate-300 font-mono">
                    {new Date(profile.lastPasswordChangeAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Complexity:</span>
                  <span className="text-indigo-400 font-semibold">Very High (16+ Entropy)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPasswordModalOpen(true)}
                className="w-full rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 shadow-md shadow-amber-600/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Change Master Password</span>
              </button>
            </div>

            {/* Hardware 2FA & FIDO2 Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-lg space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Multi-Factor Enclave</h3>
                  <p className="text-xs text-slate-400">Hardware Bound Authentication</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Primary Method:</span>
                  <span className="text-emerald-400 font-semibold">{profile.twoFactorMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Enclave Chip:</span>
                  <span className="text-slate-300 font-mono">{profile.hardwareEnclaveId}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Emergency SMS Fallback:</span>
                  <span className="text-slate-300 font-mono">{profile.phone}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast("Hardware security token challenge verified.")}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
              >
                Verify Hardware Enclave Token
              </button>
            </div>

            {/* API Access Tokens Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-lg space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h4.5a2.25 2.25 0 0 1 2.25 2.25v4.5A2.25 2.25 0 0 1 9 11.25H4.5m15 0a2.25 2.25 0 0 0 2.25-2.25V4.5a2.25 2.25 0 0 0-2.25-2.25h-4.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">API Gateway Token</h3>
                  <p className="text-xs text-slate-400">Headless API & CLI Integration</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Current Key:</span>
                  <span className="font-mono text-slate-200 text-[11px] truncate max-w-[150px]">
                    {profile.apiKeyPreview}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Permission Scope:</span>
                  <span className="text-indigo-400 font-semibold">Root Cluster Full Access</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Expiration:</span>
                  <span className="text-slate-300">Never (Rotatable)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRotateToken}
                disabled={isRotatingToken}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors disabled:opacity-50"
              >
                {isRotatingToken ? "Rotating Key..." : "Rotate Master API Key"}
              </button>
            </div>
          </div>

          {/* Full Audit Trail */}
          <SecurityAuditTrail logs={auditLogs} />
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="animate-in fade-in duration-200">
          <ActiveSessionsManager
            sessions={sessions}
            onRevokeSession={handleRevokeSession}
            onRevokeOthers={handleRevokeOthers}
          />
        </div>
      )}

      {activeTab === "settings" && (
        <div className="animate-in fade-in duration-200">
          <ClusterSettingsForm settings={settings} onSave={handleSaveSettings} />
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
        remoteSessionsCount={remoteSessionsCount}
      />
    </div>
  );
}
