"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, isAuthenticated, logout, login } = useAuth();

  const handleQuickLogin = async (email: string) => {
    try {
      await login({ email, password: "Password123!" });
    } catch (e) {
      console.error("Demo login error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Hero Section */}
        <section className="relative text-center mb-20 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/15 to-indigo-600/15 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-6 backdrop-blur-md shadow-lg shadow-cyan-500/10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>NexPhone OS 4.0 • Zero-Trust Hardware Enclave</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight sm:leading-none mb-6">
              The Next Era of <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Intelligent Security
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Experience the pinnacle of titanium smartphone craftsmanship paired with military-grade NexID biometric and cryptographic authentication.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="#auth-features"
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Manage NexID Profile</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-rose-400 border border-rose-500/30 font-semibold text-sm backdrop-blur-sm transition-all"
                  >
                    Sign Out ({user?.name?.split(" ")[0]})
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Create NexID Account</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/login"
                    className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 font-semibold text-sm backdrop-blur-sm transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Live Authentication State Inspector */}
        <section className="mb-20">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${
                  isAuthenticated
                    ? "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}>
                  {isAuthenticated ? (user?.name?.charAt(0) || "U") : "?"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">
                      {isAuthenticated ? user?.name : "Guest Session (Unauthenticated)"}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                      isAuthenticated
                        ? user?.tier === "VIP"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : user?.tier === "Enterprise"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}>
                      {isAuthenticated ? `${user?.tier} Tier` : "Anonymous"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAuthenticated ? user?.email : "Sign in or register below to activate your cryptographic customer session."}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Trigger Sign Out</span>
                    </button>
                    <Link
                      href="/forgot-password"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Test Password Reset Flow
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 mr-1 hidden sm:inline">1-Click Test Logins:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("a.vance@blackmesa.io")}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-medium transition-colors"
                    >
                      VIP Customer (Alex)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("s.tanaka@cyberdyne.co.jp")}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium transition-colors"
                    >
                      Enterprise Fleet (Sophia)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Session Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block mb-1">Session Enclave</span>
                <span className="text-cyan-400 font-semibold">{isAuthenticated ? "Active (Bearer JWT)" : "Inactive"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block mb-1">Customer ID</span>
                <span className="text-slate-200">{isAuthenticated ? (user?.customerNumber || user?.id) : "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block mb-1">Affiliated Organization</span>
                <span className="text-slate-200 truncate block">{isAuthenticated ? (user?.company || "Personal NexID") : "—"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block mb-1">FIDO2 Hardware Auth</span>
                <span className="text-emerald-400 font-semibold">Supported</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 1: Authentication Hub Showcase */}
        <section id="auth-features" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Feature 1: Customer Authentication Suite
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Production-grade identity management tailored for retail consumers and enterprise fleet managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* 1. Register */}
            <Link
              href="/register"
              className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-500/10"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">1. Register</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Dual account types (Personal vs Enterprise fleet), live 4-bar password strength meter & terms consent.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
                <span>Open Registration</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* 2. Login */}
            <Link
              href="/login"
              className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">2. Login</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Secure credentials verification, 1-click quick-fill demo chips, remember-me token storage & Passkey support.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-medium">
                <span>Access Enclave</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* 3. Logout */}
            <div
              onClick={() => {
                if (isAuthenticated) {
                  logout();
                } else {
                  handleQuickLogin("a.vance@blackmesa.io");
                }
              }}
              className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-rose-500/10 cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">3. Logout</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Invalidates local cookies, clears localStorage cryptographic tokens, and alerts server endpoint.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-rose-400 font-medium">
                <span>{isAuthenticated ? "Trigger Logout" : "Sign In First"}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* 4. Forgot Password */}
            <Link
              href="/forgot-password"
              className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">4. Forgot Password</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Cryptographic 6-digit OTP code dispatch with 15-minute validity and 60-second cooldown timer.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-medium">
                <span>Request Code</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* 5. Reset Password */}
            <Link
              href="/reset-password"
              className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">5. Reset Password</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Verify 6-digit cryptographic token, set new master password, confirm match & auto-redirect to login.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-medium">
                <span>Reset Credentials</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Device Showcase Teaser */}
        <section className="mb-16">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/80 relative overflow-hidden">
            <div className="max-w-2xl">
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider block mb-2">NexPhone Titanium Lineup</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Forged for Perfection. Engineered for Absolute Privacy.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Every NexPhone is equipped with our dedicated Secure Enclave chip that isolates biometric data from the operating system, ensuring your NexID credentials remain inviolable.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Reserve Your NexPhone
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs tracking-wider transition-colors border border-slate-700"
                >
                  Manage Existing Order
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-[10px]">
              N
            </div>
            <span className="font-semibold text-white">NexPhone Systems Inc.</span>
            <span>— NexID Commercial Platform v4.0</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-cyan-400 transition-colors">Register</Link>
            <Link href="/forgot-password" className="hover:text-cyan-400 transition-colors">Forgot Password</Link>
            <Link href="/reset-password" className="hover:text-cyan-400 transition-colors">Reset Password</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
