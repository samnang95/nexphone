"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [accountType, setAccountType] = useState<"consumer" | "enterprise">("consumer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live password strength calculation
  const passwordCriteria = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.hasLength) score++;
    if (passwordCriteria.hasUpper) score++;
    if (passwordCriteria.hasNumber) score++;
    if (passwordCriteria.hasSymbol) score++;
    return score;
  }, [passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (!password) return { text: "Too short", color: "bg-slate-700" };
    if (strengthScore <= 1) return { text: "Weak", color: "bg-rose-500" };
    if (strengthScore === 2) return { text: "Fair", color: "bg-amber-500" };
    if (strengthScore === 3) return { text: "Good", color: "bg-indigo-500" };
    return { text: "Strong Enclave", color: "bg-emerald-500" };
  }, [strengthScore, password]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError("You must accept the Terms of Service & Privacy Policy.");
      return;
    }

    try {
      await register({
        name,
        email,
        phone,
        password,
        accountType,
        company: accountType === "enterprise" ? company : undefined,
      });
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register. Please check your information.");
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Create NexPhone Account
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Join the decentralized hardware & satellite ecosystem
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-600/20 text-cyan-400 ring-1 ring-cyan-500/30">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
          </svg>
        </div>
      </div>

      {/* Account Type Selector Toggle */}
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-1">
        <button
          type="button"
          onClick={() => setAccountType("consumer")}
          className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
            accountType === "consumer"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>👤</span>
          <span>Personal Consumer</span>
        </button>
        <button
          type="button"
          onClick={() => setAccountType("enterprise")}
          className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
            accountType === "enterprise"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>🏢</span>
          <span>Enterprise Fleet</span>
        </button>
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Vance"
            required
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Work or Primary Email <span className="text-rose-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Company Name (for Enterprise) */}
        {accountType === "enterprise" && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Organization / Fleet Entity
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Black Mesa Aerospace Ltd."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        )}

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Mobile Number (for SMS & 2FA fallback)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Password <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {strengthLabel.text}
            </span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters with numbers & symbols"
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

          {/* 4-bar Password Strength Visualizer */}
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  strengthScore >= bar ? strengthLabel.color : "bg-slate-800"
                }`}
              />
            ))}
          </div>

          {/* Live Criteria Indicators */}
          <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] text-slate-400">
            <span className={`flex items-center gap-1.5 ${passwordCriteria.hasLength ? "text-emerald-400" : ""}`}>
              <span>{passwordCriteria.hasLength ? "✓" : "•"}</span> 8+ Characters
            </span>
            <span className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? "text-emerald-400" : ""}`}>
              <span>{passwordCriteria.hasUpper ? "✓" : "•"}</span> Uppercase letter
            </span>
            <span className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? "text-emerald-400" : ""}`}>
              <span>{passwordCriteria.hasNumber ? "✓" : "•"}</span> Number (0-9)
            </span>
            <span className={`flex items-center gap-1.5 ${passwordCriteria.hasSymbol ? "text-emerald-400" : ""}`}>
              <span>{passwordCriteria.hasSymbol ? "✓" : "•"}</span> Special symbol
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Confirm Password <span className="text-rose-400">*</span>
            </label>
            {passwordsMatch !== null && (
              <span
                className={`text-[10px] font-bold ${
                  passwordsMatch ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </span>
            )}
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            required
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
          />
          <label htmlFor="terms" className="text-xs text-slate-400 leading-normal cursor-pointer">
            I agree to the{" "}
            <Link href="/" className="text-indigo-400 hover:underline">
              NexPhone Master Hardware Agreement
            </Link>{" "}
            and{" "}
            <Link href="/" className="text-indigo-400 hover:underline">
              Global Privacy Charter
            </Link>
            .
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !agreedToTerms}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <span>Generating Silicon Enclave Keys...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Switch to Login link */}
      <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
        <span>Already have an account? </span>
        <Link
          href="/login"
          className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Sign in instead &rarr;
        </Link>
      </div>
    </div>
  );
}
