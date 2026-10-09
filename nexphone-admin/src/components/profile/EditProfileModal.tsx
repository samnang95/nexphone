"use client";

import React, { useState } from "react";
import type { AdminProfile, UpdateProfilePayload } from "@/types/profile";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AdminProfile;
  onSave: (payload: UpdateProfilePayload) => Promise<void>;
}

const AVATAR_PRESETS = [
  { id: "cyber_shield", name: "Cyber Shield", gradient: "from-indigo-600 via-blue-600 to-cyan-500", desc: "Default Admin" },
  { id: "satellite_mesh", name: "Satellite Mesh", gradient: "from-cyan-600 via-teal-600 to-emerald-500", desc: "Global Fleet" },
  { id: "quantum_core", name: "Quantum Core", gradient: "from-purple-600 via-indigo-600 to-pink-500", desc: "High Security" },
  { id: "titan_vault", name: "Titan Vault", gradient: "from-amber-600 via-orange-600 to-rose-500", desc: "Enclave Ops" },
  { id: "biometric_ir", name: "Biometric IR", gradient: "from-rose-600 via-pink-600 to-indigo-600", desc: "Security Lead" },
  { id: "admin_terminal", name: "Terminal Green", gradient: "from-emerald-600 via-teal-600 to-cyan-500", desc: "Infrastructure" },
];

const TIMEZONE_OPTIONS = [
  "America/Los_Angeles (UTC-7)",
  "America/New_York (UTC-4)",
  "America/Chicago (UTC-5)",
  "Europe/London (UTC+1)",
  "Europe/Berlin (UTC+2)",
  "Asia/Tokyo (UTC+9)",
  "Asia/Singapore (UTC+8)",
  "Asia/Phnom_Penh (UTC+7)",
  "Australia/Sydney (UTC+10)",
];

function EditProfileForm({
  profile,
  onClose,
  onSave,
}: {
  profile: AdminProfile;
  onClose: () => void;
  onSave: (payload: UpdateProfilePayload) => Promise<void>;
}) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [department, setDepartment] = useState(profile.department);
  const [phone, setPhone] = useState(profile.phone);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarPreset, setAvatarPreset] = useState(profile.avatarPreset || "cyber_shield");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("A valid administrative email address is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onSave({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department: department.trim(),
        phone: phone.trim(),
        timezone,
        bio: bio.trim(),
        avatarPreset,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {errorMessage && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Avatar Style Picker */}
      <div className="space-y-2">
        <label className="font-semibold text-slate-300 block">
          Administrative Identity Avatar Badge
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = avatarPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setAvatarPreset(preset.id)}
                className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-lg bg-gradient-to-tr ${preset.gradient} flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0`}
                >
                  {name.slice(0, 1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <span className="font-semibold text-white truncate block text-[11px]">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {preset.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Name & Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="font-semibold text-slate-300">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
            placeholder="System Admin"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">
            Root Admin Email <span className="text-rose-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
            placeholder="admin@nexphone.io"
            required
          />
        </div>
      </div>

      {/* Department & Phone Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="font-semibold text-slate-300">
            Department / Division
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Global Infrastructure"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">
            Emergency Phone (SMS OTP)
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
            placeholder="+1 (555) 019-2834"
          />
        </div>
      </div>

      {/* Operating Timezone */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-300">
          Primary Operating Timezone
        </label>
        <div className="relative">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="h-9 w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-8 text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bio / Responsibilities */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-300">
          Administrative Bio & Scope
        </label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Brief description of administrative authority and regional coverage..."
          className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
        />
      </div>

      {/* Action Buttons */}
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
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Profile</span>
          )}
        </button>
      </div>
    </form>
  );
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Admin Profile</h2>
              <p className="text-xs text-slate-400">
                Update administrative identity, contact routing, and visual preset
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

        {/* Keyed Form to prevent hook state reset warnings */}
        <EditProfileForm
          key={`${profile.id}-${profile.name}-${profile.email}`}
          profile={profile}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
