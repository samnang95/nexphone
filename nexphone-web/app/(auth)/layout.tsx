import type { ReactNode } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b12] text-slate-100 relative overflow-hidden">
      {/* Top Navigation */}
      <Navbar />

      {/* Ambient background glow elements */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-10 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[140px]" />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Column (Desktop) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 w-fit backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Next-Gen Hardware Enclave 3.0</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
                Secure Commercial Intelligence at Your Fingertips.
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg">
                Sign in to your NexPhone account to manage flagship pre-orders, monitor enterprise fleet dispatches, and access zero-trust hardware diagnostics.
              </p>
            </div>

            {/* Pillar Showcase */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-md transition-all hover:border-slate-700">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30 font-bold">
                  🛡️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Dual Hardware Enclave</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Biometric credentials and cryptographic keys never leave local silicon memory.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-md transition-all hover:border-slate-700">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 ring-1 ring-cyan-500/30 font-bold">
                  🛰️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Direct Satellite Mesh</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Global zero-deadzone VoWiFi and emergency telemetry routing via LEO constellations.
                  </p>
                </div>
              </div>
            </div>

            {/* Executive Testimonial */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950 p-5 text-xs text-slate-300">
              <p className="italic text-slate-300">
                &ldquo;NexPhone&rsquo;s titanium build and dedicated cryptographic chip set a new benchmark for secure corporate fleet operations.&rdquo;
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span className="font-semibold text-white">Dr. Elena Rostova</span>
                <span className="text-[11px] font-mono text-indigo-400">Chief Security Officer, Quantum Fleet</span>
              </div>
            </div>

            {/* Certifications strip */}
            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> FIDO2 Certified
              </span>
              <span>•</span>
              <span>ISO/IEC 27001</span>
              <span>•</span>
              <span>AES-256 GCM Enclave</span>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="py-4 border-t border-slate-800/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 NexPhone Commercial Systems Inc. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-white transition-colors">Security Enclave</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
