"use client";

import { useState } from "react";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: (revokeOtherSessions: boolean) => Promise<void>;
  remoteSessionsCount: number;
}

export function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirmLogout,
  remoteSessionsCount,
}: LogoutConfirmationModalProps) {
  const [revokeAll, setRevokeAll] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await onConfirmLogout(revokeAll);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Sign Out of Console?</h3>
            <p className="text-xs text-slate-400">Terminate current administrative session</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Your local session tokens and encrypted hardware enclave context will be safely cleared. You will need your master password to authenticate again.
        </p>

        {/* Option to also revoke all other remote sessions */}
        {remoteSessionsCount > 0 && (
          <label className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-950/70 p-3 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={revokeAll}
              onChange={(e) => setRevokeAll(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200 block">
                Revoke all {remoteSessionsCount} other remote stations
              </span>
              <span className="text-[11px] text-slate-400 block">
                Disconnect mobile consoles and remote data center terminals immediately.
              </span>
            </div>
          </label>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoggingOut}
            className="rounded-lg bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
          >
            {isLoggingOut ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing out...</span>
              </>
            ) : (
              <span>Confirm Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
