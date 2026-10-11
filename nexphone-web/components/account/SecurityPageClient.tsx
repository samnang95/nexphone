"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { evaluatePasswordStrength, profileService } from "@/services/profile.service";
import { AccountShell } from "./AccountShell";

const inputClass =
  "w-full px-3.5 py-2.5 pr-16 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors";
const labelClass = "text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider";

const STRENGTH_COLORS = ["bg-rose-500", "bg-rose-500", "bg-amber-400", "bg-emerald-400", "bg-cyan-400"];

function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-500 hover:text-cyan-400 transition-colors"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function SecurityContent() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changedAt, setChangedAt] = useState<string | null>(() =>
    user ? profileService.getPasswordChangedAt(user.id) : null
  );

  if (!user) return null;

  const strength = evaluatePasswordStrength(newPassword);
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await profileService.changePassword(user.id, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccess(res.message);
      setChangedAt(profileService.getPasswordChangedAt(user.id));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setIsSaving(false);
    }
  };

  const requirements: { key: keyof typeof strength.checks; label: string }[] = [
    { key: "length", label: "8+ characters" },
    { key: "upper", label: "Upper & lower case" },
    { key: "number", label: "A number" },
    { key: "symbol", label: "A symbol" },
  ];

  return (
    <>
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="pb-4 border-b border-slate-800/80">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Change Password
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {changedAt
              ? `Last changed ${new Date(changedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`
              : "Use a unique password you don't use anywhere else."}
          </p>
        </div>

        {success && (
          <div
            role="status"
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono"
          >
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg" noValidate>
          <PasswordInput
            id="current-password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />

          <div className="space-y-3">
            <PasswordInput
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />

            {newPassword.length > 0 && (
              <div className="space-y-2" aria-live="polite">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        strength.score >= i ? STRENGTH_COLORS[strength.score] : "bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-mono text-slate-400">
                  Strength: <span className="text-white font-bold">{strength.label}</span>
                </p>
                <ul className="grid grid-cols-2 gap-1.5">
                  {requirements.map((r) => (
                    <li
                      key={r.key}
                      className={`text-[11px] font-mono flex items-center gap-1.5 ${
                        strength.checks[r.key] ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      <span>{strength.checks[r.key] ? "✓" : "○"}</span>
                      {r.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <PasswordInput
              id="confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
            {mismatch && (
              <p className="text-[11px] font-mono text-rose-400">Passwords do not match.</p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-2"
          >
            {isSaving && (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
            )}
            <span>{isSaving ? "Updating..." : "Update Password"}</span>
          </button>
        </form>
      </div>

      <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
        <h3 className="font-bold text-white">Forgot your current password?</h3>
        <p className="text-slate-400 leading-relaxed">
          Sign out and use the password recovery flow to receive a 6-digit verification code.
        </p>
      </div>
    </>
  );
}

export function SecurityPageClient() {
  return (
    <AccountShell
      title="Security & Password"
      subtitle="Keep your NexID protected with a strong, unique master credential."
    >
      <SecurityContent />
    </AccountShell>
  );
}

export default SecurityPageClient;
