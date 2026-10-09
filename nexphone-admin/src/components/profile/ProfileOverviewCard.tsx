"use client";

import { useState } from "react";
import type { AdminProfile } from "@/types/profile";

interface ProfileOverviewCardProps {
  profile: AdminProfile;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onRotateToken: () => Promise<void>;
  isRotatingToken: boolean;
  activeSessionsCount: number;
}

export function ProfileOverviewCard({
  profile,
  onEditProfile,
  onChangePassword,
  onRotateToken,
  isRotatingToken,
  activeSessionsCount,
}: ProfileOverviewCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(profile.apiKeyPreview || "nx_live_998a4bc7102e88a01174d82f7d2e");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAvatarGradient = () => {
    switch (profile.avatarPreset) {
      case "satellite_mesh":
        return "from-cyan-600 via-teal-600 to-emerald-500";
      case "quantum_core":
        return "from-purple-600 via-indigo-600 to-pink-500";
      case "titan_vault":
        return "from-amber-600 via-orange-600 to-rose-500";
      case "biometric_ir":
        return "from-rose-600 via-pink-600 to-indigo-600";
      case "admin_terminal":
        return "from-emerald-600 via-teal-600 to-cyan-500";
      default:
        return "from-indigo-600 via-blue-600 to-cyan-500";
    }
  };

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Top Identity Banner Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 shadow-xl backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Core Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <div
                className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-tr ${getAvatarGradient()} text-2xl sm:text-3xl font-black text-white shadow-2xl ring-4 ring-slate-800/80`}
              >
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 ring-2 ring-slate-900">
                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {profile.name}
                </h2>
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/30">
                  {profile.role}
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
                  {profile.securityLevel}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 font-mono">
                {profile.email} • {profile.department}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  ID: <span className="font-mono text-slate-200">{profile.id}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Hardware Enclave:{" "}
                  <span className="font-mono text-slate-200">{profile.hardwareEnclaveId}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  2FA: <span className="text-emerald-300 font-semibold">{profile.twoFactorMethod}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={onEditProfile}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600/15 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
              <span>Edit Info</span>
            </button>
            <button
              type="button"
              onClick={onChangePassword}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            >
              <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
              <span>Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Profile Details & Security Posture */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Identity Specifications */}
        <div className="space-y-6 lg:col-span-2">
          {/* Detailed Field Attributes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Administrative Attributes</h3>
                <p className="text-xs text-slate-400">
                  Parameters linked to access logs, emergency dispatch, and audit trails
                </p>
              </div>
              <button
                type="button"
                onClick={onEditProfile}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Modify Attributes →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Legal / Full Name
                </span>
                <span className="text-sm font-semibold text-white block">{profile.name}</span>
                <span className="text-[11px] text-slate-500">Authorized Master Operator</span>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Root Email Address
                </span>
                <span className="text-sm font-semibold text-white font-mono block truncate">
                  {profile.email}
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span>✓</span> Verified TLS Gateway Deliverable
                </span>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Department & Division
                </span>
                <span className="text-sm font-semibold text-white block">{profile.department}</span>
                <span className="text-[11px] text-slate-500">Core Network Operations</span>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Emergency Phone (SMS OTP)
                </span>
                <span className="text-sm font-semibold text-white font-mono block">
                  {profile.phone}
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span>✓</span> Encrypted Fallback Route
                </span>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Primary Timezone
                </span>
                <span className="text-sm font-semibold text-white block">{profile.timezone}</span>
                <span className="text-[11px] text-slate-500">Auto-synced with audit logs</span>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Active Devices & Terminals
                </span>
                <span className="text-sm font-semibold text-indigo-300 block">
                  {activeSessionsCount} Authorized Stations
                </span>
                <span className="text-[11px] text-slate-500">Current station active now</span>
              </div>
            </div>

            {/* Bio / Responsibility Note */}
            {profile.bio && (
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Operational Bio & Scope
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>

          {/* Administrative API Access Token Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-indigo-400">🔑</span>
                  <span>Administrative API Gateway Token</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Cryptographic bearer key for headless CLI pipelines, remote telemetry, and sync
                </p>
              </div>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 ring-1 ring-indigo-500/20 self-start sm:self-auto">
                REST & GraphQL
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={profile.apiKeyPreview}
                  className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950/90 pl-3 pr-8 font-mono text-xs text-slate-200 select-all focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-500">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="h-9 rounded-lg border border-slate-800 bg-slate-950 px-3.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
                >
                  {copied ? "✓ Copied" : "Copy Token"}
                </button>
                <button
                  type="button"
                  onClick={onRotateToken}
                  disabled={isRotatingToken}
                  className="h-9 rounded-lg border border-slate-800 bg-slate-950 px-3.5 text-xs font-semibold text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors disabled:opacity-50"
                >
                  {isRotatingToken ? "Rotating..." : "Rotate Key"}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Never share your administrative API token in public repositories or unencrypted chat channels.
            </p>
          </div>
        </div>

        {/* Right 1 Col: Security Health & Hardware Telemetry */}
        <div className="space-y-6">
          {/* Security Score Badge */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Security Rating</h3>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/40">
                98 / 100
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 w-[98%]" />
            </div>

            <div className="space-y-2.5 text-xs pt-1">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Hardware 2FA
                </span>
                <span className="text-slate-400 font-mono">FIDO2 Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Password Strength
                </span>
                <span className="text-slate-400 font-mono">Argon2id Hash</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Enclave Binding
                </span>
                <span className="text-slate-400 font-mono">Titan-X9 Verified</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Session Isolation
                </span>
                <span className="text-slate-400 font-mono">WireGuard Mesh</span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Last Password Change:</span>
              <span className="text-slate-300 font-mono">
                {new Date(profile.lastPasswordChangeAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Quick Enclave Details */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">🛡</span>
              <span>Hardware Enclave Attestation</span>
            </h3>
            <p className="text-slate-400">
              Your cryptographic credentials execute inside a dedicated physical coprocessor separate from application memory.
            </p>
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Coprocessor:</span>
                <span className="text-slate-300">Titan-X9 Quad</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Certificate:</span>
                <span className="text-emerald-400">Valid (2026-2028)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Root of Trust:</span>
                <span className="text-indigo-400">NexPhone PKI CA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
