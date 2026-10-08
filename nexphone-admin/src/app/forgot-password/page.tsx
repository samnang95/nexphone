"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/routes";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await requestPasswordReset(email);
    setIsSubmitting(false);
    setIsSent(true);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 font-bold text-amber-400 shadow-lg">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Recover Admin Access
            </h1>
            <p className="text-xs text-slate-400">
              Dispatches an encrypted one-time recovery token to verify identity.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {isSent ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Recovery Instructions Dispatched</span>
                </div>
                <p className="text-slate-300">
                  We have sent an authentication challenge with a temporary recovery link to:
                </p>
                <p className="font-mono font-bold text-white break-all">{email}</p>
                <p className="text-[11px] text-slate-400">
                  The link expires in 15 minutes. Check spam or corporate filter if delayed.
                </p>
              </div>

              {/* Direct Link to test Reset Password */}
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/30 p-3.5 text-center">
                <span className="text-xs text-slate-300 block mb-2">Simulate Received Link:</span>
                <Link
                  href={`${ROUTES.AUTH.RESET_PASSWORD}?email=${encodeURIComponent(email)}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
                >
                  Proceed to Reset Password &rarr;
                </Link>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Try different email
                </button>
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="recovery-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Administrative Email Address
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  required
                  placeholder="admin@nexphone.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Must match the enterprise account registered with your hardware cluster.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Transmitting Challenge...</span>
                  </>
                ) : (
                  <span>Send Recovery Link</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  &larr; Back to Admin Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
