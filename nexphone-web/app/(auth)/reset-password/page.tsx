"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isLoading } = useAuth();

  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [code, setCode] = useState(() => searchParams.get("code") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);

  // Auto redirect countdown on success
  useEffect(() => {
    if (!isSuccess) return;
    if (redirectCount <= 0) {
      router.push("/login?reset=success");
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCount((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isSuccess, redirectCount, router]);

  // Password strength calculation
  const strength = useMemo(() => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  }, [newPassword]);

  const strengthMeta = useMemo(() => {
    switch (strength) {
      case 1:
        return { label: "Weak", color: "bg-red-500", text: "text-red-400" };
      case 2:
        return { label: "Fair", color: "bg-amber-500", text: "text-amber-400" };
      case 3:
        return { label: "Good", color: "bg-blue-500", text: "text-blue-400" };
      case 4:
        return { label: "Cryptographically Strong", color: "bg-emerald-500", text: "text-emerald-400" };
      default:
        return { label: "Enter Password", color: "bg-slate-700", text: "text-slate-500" };
    }
  }, [strength]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !newPassword) {
      setError("Please complete all required fields.");
      return;
    }
    if (code.trim().length !== 6) {
      setError("Verification code must be exactly 6 digits.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-check.");
      return;
    }

    setError(null);
    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password reset failed. Invalid or expired code.";
      setError(msg);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-4">
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Cryptographic Reset Enclave
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Set New Password</h1>
        <p className="text-sm text-slate-400 mt-2">
          Verify your 6-digit identity code and define a new secure cryptographic master password for your NexID.
        </p>
      </div>

      {/* Success Notification Modal / Card */}
      {isSuccess ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Password Successfully Reset</h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed mb-4">
              Your NexID master credentials have been updated across all hardware enclaves. You may now sign in with your new password.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Redirecting to Sign In in {redirectCount}s...</span>
            </div>
          </div>

          <Link
            href="/login?reset=success"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In Now</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-fadeIn">
              <svg className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">Reset Failed</p>
                <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="reset-email" className="block text-xs font-medium text-slate-300 mb-1.5">
              Account Email
            </label>
            <input
              id="reset-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@enterprise.com"
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
            />
          </div>

          {/* 6-Digit Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="reset-code" className="block text-xs font-medium text-slate-300">
                6-Digit Cryptographic Code
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Resend code?
              </Link>
            </div>
            <div className="relative">
              <input
                id="reset-code"
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="849201"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white font-mono text-center tracking-[0.4em] text-lg placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enter the 6-digit code received via email or recovery dispatch.
            </p>
          </div>

          {/* New Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="new-password" className="block text-xs font-medium text-slate-300">
                New Password
              </label>
              <span className={`text-[11px] font-mono font-medium ${strengthMeta.text}`}>
                {strengthMeta.label}
              </span>
            </div>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create new master password"
                className="w-full pl-4 pr-11 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Dynamic Strength Bars */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              <div className={`h-1 rounded-full transition-all duration-300 ${strength >= 1 ? strengthMeta.color : "bg-slate-800"}`} />
              <div className={`h-1 rounded-full transition-all duration-300 ${strength >= 2 ? strengthMeta.color : "bg-slate-800"}`} />
              <div className={`h-1 rounded-full transition-all duration-300 ${strength >= 3 ? strengthMeta.color : "bg-slate-800"}`} />
              <div className={`h-1 rounded-full transition-all duration-300 ${strength >= 4 ? strengthMeta.color : "bg-slate-800"}`} />
            </div>

            {/* Password Criteria Checklist */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-2.5">
              <span className={`inline-flex items-center gap-1.5 ${newPassword.length >= 8 ? "text-emerald-400" : "text-slate-500"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" /> 8+ characters
              </span>
              <span className={`inline-flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? "text-emerald-400" : "text-slate-500"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" /> Uppercase letter
              </span>
              <span className={`inline-flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? "text-emerald-400" : "text-slate-500"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" /> Numerical digit
              </span>
              <span className={`inline-flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-400" : "text-slate-500"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" /> Special symbol
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="confirm-new-password" className="block text-xs font-medium text-slate-300">
                Confirm New Password
              </label>
              {confirmPassword.length > 0 && (
                <span className={`text-[11px] font-medium ${passwordsMatch ? "text-emerald-400" : "text-rose-400"}`}>
                  {passwordsMatch ? "✓ Passwords Match" : "✕ Does Not Match"}
                </span>
              )}
            </div>
            <input
              id="confirm-new-password"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !passwordsMatch || code.length !== 6}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 pt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating Master Credentials...</span>
              </>
            ) : (
              <>
                <span>Confirm & Reset Password</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </form>
      )}

      {/* Return to Sign in */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-sm text-slate-400">
        <span>Never mind?</span>
        <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 flex items-center justify-center text-slate-400 gap-2">
          <svg className="animate-spin w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading cryptographic enclave...</span>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
