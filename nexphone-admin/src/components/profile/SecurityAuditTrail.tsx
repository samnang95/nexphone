"use client";

import type { AdminSecurityAuditLog } from "@/types/profile";

interface SecurityAuditTrailProps {
  logs: AdminSecurityAuditLog[];
}

export function SecurityAuditTrail({ logs }: SecurityAuditTrailProps) {
  const getStatusBadge = (status: "success" | "warn" | "danger") => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
            <span>✓</span> Success
          </span>
        );
      case "warn":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/30">
            <span>⚠</span> Alert
          </span>
        );
      case "danger":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-400 ring-1 ring-rose-500/30">
            <span>✕</span> Revoked
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-xl overflow-hidden">
      <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Immutable Security Audit Trail
          </h3>
          <p className="text-[11px] text-slate-400">
            Cryptographically signed event ledger for root administrative actions
          </p>
        </div>
        <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-300 ring-1 ring-indigo-500/20">
          SHA-256 Chained
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Event Action</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Origin IP</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(log.status)}
                    <span className="font-semibold text-white">{log.action}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                  {log.actor}
                </td>
                <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                  {log.ipAddress}
                </td>
                <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                  {log.details}
                </td>
                <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
