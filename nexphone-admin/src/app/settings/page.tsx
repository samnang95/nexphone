"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { appConfig } from "@/config/env";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { profileService } from "@/services/profile.service";
import { ClusterSettingsForm } from "@/components/profile/ClusterSettingsForm";
import { ROUTES } from "@/routes";
import type { ClusterSettings } from "@/types/profile";

export default function SettingsPage() {
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    profileService.getProfile().then((data) => {
      if (!isMounted) return;
      setSettings(data.settings);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveSettings = async (updatedSettings: Partial<ClusterSettings>) => {
    const updated = await profileService.updateClusterSettings(updatedSettings);
    setSettings(updated);
    setToastMessage("Cluster settings updated and committed.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Cluster Settings
            </h1>
            <Badge
              variant={
                appConfig.isProd ? "success" : appConfig.isStaging ? "warning" : "default"
              }
            >
              FLAVOR: {appConfig.flavor.toUpperCase()}
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Environment flavor parameters, API gateway coordinates, and security configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.PROFILE}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition-colors"
          >
            <span>👤</span>
            <span>Admin Profile & Security</span>
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Embedded Cluster Settings Form */}
      <ClusterSettingsForm settings={settings} onSave={handleSaveSettings} />
    </div>
  );
}
