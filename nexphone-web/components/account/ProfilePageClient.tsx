"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { profileService } from "@/services/profile.service";
import { AccountShell } from "./AccountShell";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-60";
const labelClass = "text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase font-mono text-slate-500">{label}</span>
      <p className={`text-sm ${value ? "text-white font-semibold" : "text-slate-600 italic"}`}>
        {value || "Not provided"}
      </p>
    </div>
  );
}

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const startEditing = () => {
    setName(user.name);
    setPhone(user.phone ?? "");
    setCompany(user.company ?? "");
    setError(null);
    setSaved(false);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const next = await profileService.updateProfile(user, { name, phone, company });
      updateUser(next);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            {isEditing ? "Edit Profile" : "Personal Details"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Member since {memberSince}</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={startEditing}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-cyan-500/20 active:scale-95"
          >
            Edit Profile
          </button>
        )}
      </div>

      {saved && (
        <div
          role="status"
          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono"
        >
          ✓ Profile updated successfully.
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="profile-name" className={labelClass}>
                Full name <span className="text-rose-400">*</span>
              </label>
              <input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="profile-email" className={labelClass}>
                Email address
              </label>
              <input id="profile-email" value={user.email} disabled className={inputClass} />
              <p className="text-[11px] text-slate-500 font-mono">
                Email is bound to your NexID and cannot be changed here.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-company" className={labelClass}>
                Company
              </label>
              <input
                id="profile-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                autoComplete="organization"
                placeholder="Optional"
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono"
            >
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-2"
            >
              {isSaving && (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              )}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Full name" value={user.name} />
          <Field label="Email address" value={user.email} />
          <Field label="Phone" value={user.phone} />
          <Field label="Company" value={user.company} />
          <Field label="Customer number" value={user.customerNumber} />
          <Field label="Account tier" value={user.tier} />
        </div>
      )}
    </div>
  );
}

export function ProfilePageClient() {
  return (
    <AccountShell
      title="Customer Profile"
      subtitle="Review and update your personal details. Changes apply across checkout and order receipts."
    >
      <ProfileContent />
    </AccountShell>
  );
}

export default ProfilePageClient;
