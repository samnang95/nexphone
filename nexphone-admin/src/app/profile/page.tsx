"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || "System Admin");
  const [email, setEmail] = useState(user?.email || "admin@nexphone.io");
  const [department, setDepartment] = useState(user?.department || "Global Infrastructure & Core Platform");
  const [phone, setPhone] = useState(user?.phone || "+1 (555) 019-2834");
  const [timezone, setTimezone] = useState(user?.timezone || "America/Los_Angeles (UTC-7)");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      name,
      email,
      department,
      phone,
      timezone,
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(user?.apiKeyPreview || "nx_live_998a4bc7102e");
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Admin Profile & Access
            </h1>
            <Badge variant="success">Active Session</Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Administrative identity, cryptographic credentials, and multi-factor hardware policies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowLogoutConfirm(true)}
          >
            Sign Out
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Profile settings updated and committed successfully.</span>
          </div>
        </div>
      )}

      {/* Profile Overview Card & Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Identity Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-2xl font-bold text-white shadow-xl ring-4 ring-indigo-500/20">
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>

            <h2 className="text-lg font-bold text-white">{name}</h2>
            <span className="text-xs text-slate-400 font-mono">{email}</span>

            <div className="mt-3">
              <Badge variant="default">
                {user?.role || "Super Administrator"}
              </Badge>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Admin ID:</span>
              <span className="text-slate-200">{user?.id || "usr-001"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Role Level:</span>
              <span className="text-indigo-400 font-sans font-semibold">Tier 1 Root</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">2FA Security:</span>
              <span className="text-emerald-400 font-sans font-semibold">FIDO2 WebAuthn</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Last Login:</span>
              <span className="text-slate-300">Just now</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors"
            >
              Terminate Current Session
            </button>
          </div>
        </div>

        {/* Right: Personal Info & Security Credentials */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Info Form */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h2 className="text-base font-semibold text-white mb-1">Personal & Work Profile</h2>
            <p className="text-xs text-slate-400 mb-6">Manage how you are identified across admin audit events</p>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Emergency Phone (SMS OTP)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Operating Timezone
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </form>
          </div>

          {/* Security Credentials & API Token */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-5">
            <div>
              <h2 className="text-base font-semibold text-white mb-1">Administrative API Token</h2>
              <p className="text-xs text-slate-400">Personal access key for CLI automation & direct gateway queries</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value="nx_live_998a4bc7102e88a01174d"
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-300 select-all"
              />
              <Button variant="secondary" size="sm" onClick={handleCopyToken}>
                {tokenCopied ? "Copied!" : "Copy Token"}
              </Button>
              <Button variant="secondary" size="sm">
                Rotate
              </Button>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Password & Enclave Credential</h3>
                  <p className="text-xs text-slate-400">Last changed 14 days ago</p>
                </div>
                <Button variant="secondary" size="sm">
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Administrative Sessions */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm">
        <div className="border-b border-slate-800 bg-slate-950/40 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Active Management Sessions</h2>
            <p className="text-xs text-slate-400">Terminals currently authorized with your admin profile</p>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            Revoke All Other Sessions
          </button>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-white block">macOS Chrome 134 • Current Session</span>
                <span className="text-slate-400 font-mono">192.168.1.104 • San Francisco, CA</span>
              </div>
            </div>
            <Badge variant="success">Active Now</Badge>
          </div>

          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-white block">NexPhone Pro Max X (Mobile Console)</span>
                <span className="text-slate-400 font-mono">10.240.12.84 • WireGuard Internal</span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-rose-400 transition-colors">
              Revoke
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sign Out of Console?</h3>
                <p className="text-xs text-slate-400">You will need your password to log back in.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Your terminal credentials and local hardware enclave tokens will be safely cleared.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
              >
                Confirm Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
