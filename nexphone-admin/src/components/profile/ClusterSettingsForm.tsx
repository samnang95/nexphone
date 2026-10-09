"use client";

import React, { useState } from "react";
import type { ClusterSettings } from "@/types/profile";

interface ClusterSettingsFormProps {
  settings: ClusterSettings;
  onSave: (updated: Partial<ClusterSettings>) => Promise<void>;
}

export function ClusterSettingsForm({ settings, onSave }: ClusterSettingsFormProps) {
  const [heartbeatTimeoutSec, setHeartbeatTimeoutSec] = useState(settings.heartbeatTimeoutSec);
  const [mediaIngestionRate, setMediaIngestionRate] = useState(settings.mediaIngestionRate);
  const [incidentWebhookUrl, setIncidentWebhookUrl] = useState(settings.incidentWebhookUrl);
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.autoLockMinutes);
  const [enforceHardware2FA, setEnforceHardware2FA] = useState(settings.enforceHardware2FA);
  const [allowSubnetCIDR, setAllowSubnetCIDR] = useState(settings.allowSubnetCIDR);
  const [notifyOnNewLogin, setNotifyOnNewLogin] = useState(settings.notifyOnNewLogin);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave({
        heartbeatTimeoutSec: Number(heartbeatTimeoutSec),
        mediaIngestionRate,
        incidentWebhookUrl: incidentWebhookUrl.trim(),
        autoLockMinutes: Number(autoLockMinutes),
        enforceHardware2FA,
        allowSubnetCIDR: allowSubnetCIDR.trim(),
        notifyOnNewLogin,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setHeartbeatTimeoutSec(settings.heartbeatTimeoutSec);
    setMediaIngestionRate(settings.mediaIngestionRate);
    setIncidentWebhookUrl(settings.incidentWebhookUrl);
    setAutoLockMinutes(settings.autoLockMinutes);
    setEnforceHardware2FA(settings.enforceHardware2FA);
    setAllowSubnetCIDR(settings.allowSubnetCIDR);
    setNotifyOnNewLogin(settings.notifyOnNewLogin);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Cluster gateway preferences and security policies saved successfully.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Active Flavor Status Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Cluster Flavor Profile</h3>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-slate-400 font-sans block text-[11px]">Active Flavor</span>
              <span className="font-bold text-indigo-400 uppercase text-sm">
                {settings.flavor}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-sans block text-[11px]">Admin Gateway Port</span>
              <span className="text-slate-200">3001</span>
            </div>

            <div>
              <span className="text-slate-400 font-sans block text-[11px]">API Backend Port</span>
              <span className="text-slate-200">3000</span>
            </div>

            <div>
              <span className="text-slate-400 font-sans block text-[11px]">Mutual TLS Status</span>
              <span className="text-emerald-400">Enforced (TLS 1.3)</span>
            </div>
          </div>
        </div>

        {/* Right: Parameters Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-lg lg:col-span-2 space-y-5 text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Telemetry & Gateway Parameters</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Sync intervals, security auto-lock, and automated incident alert webhooks
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Device Heartbeat Timeout (seconds)
              </label>
              <input
                type="number"
                min={10}
                max={300}
                value={heartbeatTimeoutSec}
                onChange={(e) => setHeartbeatTimeoutSec(Number(e.target.value))}
                className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                VoIP Quality Ingestion Rate
              </label>
              <div className="relative">
                <select
                  value={mediaIngestionRate}
                  onChange={(e) =>
                    setMediaIngestionRate(e.target.value as "realtime" | "5s" | "30s")
                  }
                  className="h-9 w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 pl-3 pr-8 text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="realtime">Continuous Real-time (WebSocket)</option>
                  <option value="5s">Every 5 Seconds (Batched)</option>
                  <option value="30s">Every 30 Seconds (Low Bandwidth)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Cluster Incident Alert Webhook (Slack / Discord / PagerDuty)
            </label>
            <input
              type="url"
              value={incidentWebhookUrl}
              onChange={(e) => setIncidentWebhookUrl(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 font-mono text-xs text-white focus:border-indigo-500 focus:outline-none"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Console Auto-Lock Idle Timeout (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Authorized Subnet CIDRs
              </label>
              <input
                type="text"
                value={allowSubnetCIDR}
                onChange={(e) => setAllowSubnetCIDR(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 font-mono text-xs text-white focus:border-indigo-500 focus:outline-none"
                placeholder="192.168.0.0/16, 10.240.0.0/16"
              />
            </div>
          </div>

          {/* Security Rules Toggles */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enforceHardware2FA}
                onChange={(e) => setEnforceHardware2FA(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-semibold text-slate-200 block">
                  Enforce Hardware Enclave 2FA (FIDO2) for All Admins
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Disallow standard SMS OTP for root actions; require biometric or hardware token.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnNewLogin}
                onChange={(e) => setNotifyOnNewLogin(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-semibold text-slate-200 block">
                  Urgent SMS Dispatch on New Unrecognized Station
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Send immediate high-priority SMS alert whenever an administrative session is opened from a new IP.
                </span>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              {isSaving ? "Saving..." : "Save Cluster Preferences"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
