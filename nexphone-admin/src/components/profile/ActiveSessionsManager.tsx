"use client";

import { useState } from "react";
import type { AdminSession } from "@/types/profile";

interface ActiveSessionsManagerProps {
  sessions: AdminSession[];
  onRevokeSession: (id: string) => Promise<void>;
  onRevokeOthers: () => Promise<void>;
}

export function ActiveSessionsManager({
  sessions,
  onRevokeSession,
  onRevokeOthers,
}: ActiveSessionsManagerProps) {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  const currentSession = sessions.find((s) => s.current);
  const otherSessions = sessions.filter((s) => !s.current);

  const handleRevokeSingle = async (id: string) => {
    try {
      setRevokingId(id);
      await onRevokeSession(id);
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    try {
      setIsRevokingAll(true);
      await onRevokeOthers();
    } finally {
      setIsRevokingAll(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        );
      case "terminal":
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>💻</span>
            <span>Authorized Management Stations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active terminals authorized with root enclave administrative credentials
          </p>
        </div>

        {otherSessions.length > 0 && (
          <button
            type="button"
            onClick={handleRevokeAll}
            disabled={isRevokingAll}
            className="self-start sm:self-auto rounded-lg border border-rose-500/30 bg-rose-950/20 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isRevokingAll ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-300 border-t-transparent" />
                <span>Revoking...</span>
              </>
            ) : (
              <span>Revoke All Other Stations ({otherSessions.length})</span>
            )}
          </button>
        )}
      </div>

      {/* Current Session Card */}
      {currentSession && (
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-slate-900/60 p-5 backdrop-blur-xl shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Current Terminal Session
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/40">
              Active Now
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                {getDeviceIcon(currentSession.deviceType)}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{currentSession.deviceName}</h3>
                <span className="text-slate-400 font-mono">
                  {currentSession.ipAddress} • {currentSession.location}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-[11px] text-slate-400">
              <span className="block text-slate-300">{currentSession.browser}</span>
              <span>Session ID: {currentSession.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* Other Sessions List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-3.5 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Remote Authorized Stations ({otherSessions.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Mutual TLS 1.3 Active</span>
        </div>

        {otherSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-white">No other remote sessions active</p>
            <p>Your current terminal is the only device currently authenticated to this account.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 text-xs">
            {otherSessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-5 hover:bg-slate-850/50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                    {getDeviceIcon(session.deviceType)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{session.deviceName}</h4>
                    <span className="text-slate-400 font-mono">
                      {session.ipAddress} • {session.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-left sm:text-right text-[11px]">
                    <span className="text-slate-300 block">{session.browser}</span>
                    <span className="text-slate-500">
                      Active {new Date(session.lastActiveAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevokeSingle(session.id)}
                    disabled={revokingId === session.id}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 font-semibold text-slate-300 hover:border-rose-500/50 hover:bg-rose-950/20 hover:text-rose-300 transition-colors disabled:opacity-50"
                  >
                    {revokingId === session.id ? "Revoking..." : "Revoke Access"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
