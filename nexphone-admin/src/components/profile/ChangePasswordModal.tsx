"use client";

import React, { useState } from "react";
import type { ChangePasswordPayload } from "@/types/profile";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ChangePasswordPayload) => Promise<void>;
}

function ChangePasswordForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: ChangePasswordPayload) => Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password rules validation
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const criteriaPassed = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthPercent = (criteriaPassed / 5) * 100;

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrorMessage("Please enter your current administrative password.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match. Please verify.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onSubmit({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    if (criteriaPassed <= 2) return "bg-rose-500";
    if (criteriaPassed <= 4) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthLabel = () => {
    if (criteriaPassed <= 2) return "Weak";
    if (criteriaPassed <= 4) return "Good";
    return "Very Strong";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {errorMessage && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Current Password */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-300">
          Current Master Password <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-9 text-xs text-white focus:border-indigo-500 focus:outline-none"
            placeholder="••••••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-white"
          >
            {showCurrent ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-300">
            New Secure Password <span className="text-rose-400">*</span>
          </label>
          {newPassword && (
            <span className="text-[11px] font-semibold text-slate-400">
              Strength:{" "}
              <span
                className={
                  criteriaPassed <= 2
                    ? "text-rose-400"
                    : criteriaPassed <= 4
                    ? "text-amber-400"
                    : "text-emerald-400"
                }
              >
                {getStrengthLabel()}
              </span>
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-9 text-xs text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Minimum 8 characters with numbers & symbols"
            required
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-white"
          >
            {showNew ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        </div>

        {/* Strength Progress Meter */}
        {newPassword && (
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${strengthPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Rules Checklist */}
      <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-[11px]">
        <span className={hasMinLength ? "text-emerald-400 font-medium" : "text-slate-500"}>
          {hasMinLength ? "✓" : "○"} 8+ characters
        </span>
        <span className={hasUpper ? "text-emerald-400 font-medium" : "text-slate-500"}>
          {hasUpper ? "✓" : "○"} Uppercase letter
        </span>
        <span className={hasLower ? "text-emerald-400 font-medium" : "text-slate-500"}>
          {hasLower ? "✓" : "○"} Lowercase letter
        </span>
        <span className={hasNumber ? "text-emerald-400 font-medium" : "text-slate-500"}>
          {hasNumber ? "✓" : "○"} Numerical digit
        </span>
        <span className={`col-span-2 ${hasSpecial ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
          {hasSpecial ? "✓" : "○"} Special symbol (!@#$%^&*)
        </span>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-300">
            Confirm New Password <span className="text-rose-400">*</span>
          </label>
          {confirmPassword && (
            <span
              className={`text-[11px] font-semibold ${
                passwordsMatch ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {passwordsMatch ? "✓ Passwords Match" : "✕ Does not match"}
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-9 text-xs text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Re-enter new secure password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-white"
          >
            {showConfirm ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3 text-[11px] text-indigo-300">
        Changing your master password will re-salt your administrative enclave credentials and record an entry in the immutable audit log.
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !passwordsMatch || criteriaPassed < 2}
          className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50 transition-colors shadow-lg shadow-amber-600/30 flex items-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Updating...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </div>
    </form>
  );
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600/20 text-amber-400 ring-1 ring-amber-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Change Master Password</h2>
              <p className="text-xs text-slate-400">
                Update root enclave credentials & authorization phrase
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ChangePasswordForm
          key="change-password-form"
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
