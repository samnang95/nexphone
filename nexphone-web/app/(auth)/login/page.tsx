"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      await login({ email, password, rememberMe });
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.");
    }
  };

  // Quick 1-click test fill helper
  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError(null);
  };

  const handlePasskeyLogin = async () => {
    setIsPasskeyLoading(true);
    setError(null);
    try {
      // Simulate WebAuthn Biometric Enclave Challenge
      await new Promise((res) => setTimeout(res, 800));
      await login({
        email: "a.vance@blackmesa.io",
        password: "Password123!",
        rememberMe: true,
      });
      router.push("/");
    } catch {
      setError("Passkey verification timed out. Please sign in with password.");
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative">
      {/* Decorative top pill */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Sign In to NexPhone
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Hardware enclave & commercial customer portal
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
      </div>

      {/* Quick 1-Click Demo Fillers */}
      <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300 mb-2">
          <span>⚡ Quick 1-Click Demo Accounts</span>
          <span className="text-indigo-400/80 font-mono">Password: Password123!</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill("a.vance@blackmesa.io")}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-left text-xs hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all"
          >
            <div className="font-semibold text-white truncate">Alex Vance</div>
            <div className="text-[10px] text-amber-400 font-mono">VIP Account</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("s.tanaka@cyberdyne.co.jp")}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-left text-xs hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all"
          >
            <div className="font-semibold text-white truncate">Sophia Tanaka</div>
            <div className="text-[10px] text-indigo-400 font-mono">Enterprise Fleet</div>
          </button>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          <svg className="h-4 w-4 shrink-0 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email or Registered Phone
          </label>
          <div className="relative">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@enterprise.com"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember me toggle */}
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <span>Remember this device for 30 days</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <span>Authenticating Enclave...</span>
            </>
          ) : (
            <>
              <span>Sign In to Account</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>

        {/* Passkey Biometric CTA */}
        <button
          type="button"
          onClick={handlePasskeyLogin}
          disabled={isPasskeyLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-all disabled:opacity-50"
        >
          {isPasskeyLoading ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
              <span className="text-cyan-400">Verifying Face ID / Hardware Key...</span>
            </>
          ) : (
            <>
              <span className="text-sm">🔑</span>
              <span>Sign In with Passkey / Face ID</span>
            </>
          )}
        </button>
      </form>

      {/* SSO Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800/80" />
        </div>
        <span className="relative bg-[#090d16] px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
          Or enterprise SSO
        </span>
      </div>

      {/* Social / SSO Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => handleQuickFill("a.vance@blackmesa.io")}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span className="hidden sm:inline">Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickFill("s.tanaka@cyberdyne.co.jp")}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.82 1.13-1.96 1-3.1-.98.04-2.16.65-2.85 1.46-.61.71-1.14 1.88-.99 2.99 1.09.08 2.18-.54 2.84-1.35z"/>
          </svg>
          <span className="hidden sm:inline">Apple</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickFill("a.vance@blackmesa.io")}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="hidden sm:inline">SAML / Okta</span>
        </button>
      </div>

      {/* Switch to Register link */}
      <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
        <span>Don&rsquo;t have a NexPhone account yet? </span>
        <Link
          href="/register"
          className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Create an account &rarr;
        </Link>
      </div>
    </div>
  );
}
