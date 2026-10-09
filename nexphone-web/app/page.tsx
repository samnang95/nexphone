"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/routes";
import { contentService } from "@/services/content.service";
import { brandService } from "@/services/brand.service";
import { promotionService } from "@/services/promotion.service";
import type {
  HomepageBanner,
  FeaturedPhone,
  NewArrival,
  BestSeller,
  PromotionalSection,
} from "@/types/content";
import type { Brand } from "@/types/brand";
import type { Promotion } from "@/types/promotion";

import { HeroBannerCarousel } from "@/components/home/HeroBannerCarousel";
import { FeaturedPhonesSection } from "@/components/home/FeaturedPhonesSection";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { BestSellersSection } from "@/components/home/BestSellersSection";
import { DealsSection } from "@/components/home/DealsSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import {
  PhoneQuickViewModal,
  type QuickViewPhone,
} from "@/components/home/PhoneQuickViewModal";

export default function HomePage() {
  const { isAuthenticated, logout, login } = useAuth();

  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [featuredPhones, setFeaturedPhones] = useState<FeaturedPhone[]>([]);
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [promoSections, setPromoSections] = useState<PromotionalSection[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quickViewPhone, setQuickViewPhone] = useState<QuickViewPhone | null>(null);
  const [dealToast, setDealToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadHomeContent() {
      try {
        const [b, f, n, bs, ps, br, pr] = await Promise.all([
          contentService.getBanners(),
          contentService.getFeaturedPhones(),
          contentService.getNewArrivals(),
          contentService.getBestSellers(),
          contentService.getPromotionalSections(),
          brandService.getBrands(),
          promotionService.getPromotions(),
        ]);
        setBanners(b);
        setFeaturedPhones(f);
        setNewArrivals(n);
        setBestSellers(bs);
        setPromoSections(ps);
        setBrands(br);
        setPromotions(pr);
      } catch (err) {
        console.error("Failed to load home page content:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeContent();
  }, []);

  const handleQuickLogin = async (email: string) => {
    try {
      await login({ email, password: "Password123!" });
    } catch (e) {
      console.error("Demo login error:", e);
    }
  };

  const handleDealSelected = (promoCode: string) => {
    setDealToast(`Coupon code ${promoCode} copied! Applied to your checkout.`);
    setTimeout(() => {
      setDealToast(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      {/* Floating Coupon Toast */}
      {dealToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-2xl shadow-cyan-500/40 animate-in slide-in-from-bottom-5">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>{dealToast}</span>
        </div>
      )}

      {/* Quick Jump Anchor Bar */}
      <div className="sticky top-16 z-30 w-full border-b border-slate-800/60 bg-[#080c14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-11 text-xs">
          <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar font-medium">
            <a href="#featured-phones" className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors whitespace-nowrap">
              Featured Phones
            </a>
            <a href="#new-arrivals" className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 transition-colors whitespace-nowrap">
              New Arrivals
            </a>
            <a href="#best-sellers" className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/50 transition-colors whitespace-nowrap">
              Best Sellers
            </a>
            <a href="#deals-section" className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors whitespace-nowrap">
              Deals & Coupons
            </a>
            <a href="#partner-brands" className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-slate-800/50 transition-colors whitespace-nowrap">
              Ecosystem Brands
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isLoading ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
            <span>{isLoading ? "Synchronizing Telemetry..." : "Encrypted Fleet Store Online"}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 1. Hero Dynamic Banner Carousel */}
        <HeroBannerCarousel
          banners={banners}
          onOpenQuickView={(phone) => setQuickViewPhone(phone)}
        />

        {/* 2. Featured Phones */}
        <FeaturedPhonesSection
          phones={featuredPhones}
          onOpenQuickView={(phone) => setQuickViewPhone(phone)}
        />

        {/* 3. New Arrivals */}
        <NewArrivalsSection
          newArrivals={newArrivals}
          onOpenQuickView={(phone) => setQuickViewPhone(phone)}
        />

        {/* 4. Best Sellers */}
        <BestSellersSection
          bestSellers={bestSellers}
          onOpenQuickView={(phone) => setQuickViewPhone(phone)}
        />

        {/* 5. Deals & Promotions */}
        <DealsSection
          promotions={promotions}
          promoSections={promoSections}
          onSelectDeal={handleDealSelected}
        />

        {/* 6. Partner Brands */}
        <BrandsSection
          brands={brands}
          onSelectBrand={() => {
            const el = document.getElementById("featured-phones");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* Feature 1 Hub: Authentication & Customer Testing Suite */}
        <section id="auth-features" className="mb-20 pt-8 border-t border-slate-800/80">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono mb-3">
              <span>Zero-Trust Infrastructure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Customer Identity & Enclave Access
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Test the commercial customer authentication endpoints, recovery token dispatch, and session invalidation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Register */}
            <Link
              href={ROUTES.AUTH.REGISTER}
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
                  Personal or Enterprise fleet accounts with 4-bar password meter.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
                <span>Create NexID</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* 2. Login */}
            <Link
              href={ROUTES.AUTH.LOGIN}
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
                  1-click quick-fill demo credentials and JWT session tokens.
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
                  Invalidates local cookies, clears localStorage, alerts server.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-rose-400 font-medium">
                <span>{isAuthenticated ? "Trigger Logout" : "Sign In First"}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* 4. Forgot Password */}
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
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
                  Cryptographic 6-digit OTP code dispatch with 15-minute validity.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-medium">
                <span>Request Code</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* 5. Reset Password */}
            <Link
              href={ROUTES.AUTH.RESET_PASSWORD}
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
                  Verify 6-digit cryptographic token, set new master password.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-medium">
                <span>Reset Credentials</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Quick View Modal */}
      <PhoneQuickViewModal
        phone={quickViewPhone}
        onClose={() => setQuickViewPhone(null)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 py-12 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                  N
                </div>
                <span className="font-bold text-white text-sm">NexPhone Systems</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Hardware-bound zero-trust mobile architecture with global satellite mesh transceivers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Hardware</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#featured-phones" className="hover:text-cyan-400 transition-colors">Featured Flagships</a></li>
                <li><a href="#new-arrivals" className="hover:text-emerald-400 transition-colors">New Releases</a></li>
                <li><a href="#best-sellers" className="hover:text-amber-400 transition-colors">Leaderboards</a></li>
                <li><a href="#deals-section" className="hover:text-cyan-400 transition-colors">Active Promotions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Customer Portal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href={ROUTES.AUTH.LOGIN} className="hover:text-cyan-400 transition-colors">NexID Sign In</Link></li>
                <li><Link href={ROUTES.AUTH.REGISTER} className="hover:text-cyan-400 transition-colors">Register Account</Link></li>
                <li><Link href={ROUTES.AUTH.FORGOT_PASSWORD} className="hover:text-cyan-400 transition-colors">Password Recovery</Link></li>
                <li><Link href={ROUTES.ORDERS.ROOT} className="hover:text-cyan-400 transition-colors">Order Tracking</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Zero-Trust Telemetry</h4>
              <p className="text-slate-400 leading-relaxed mb-3">
                All communications encrypted with post-quantum Kyber-1024 cryptography.
              </p>
              <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>API Status: Operational (Port 4000)</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>© 2026 NexPhone Systems Inc. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-400">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400">Terms of Service</a>
              <a href="#" className="hover:text-slate-400">Security Whitepaper</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
