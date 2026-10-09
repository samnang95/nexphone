"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { useWishlist } from "@/context/WishlistContext";
import { ROUTES } from "@/routes";

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { openCart, totalItems } = useCart();
  const { totalCompare } = useCompare();
  const { totalWishlist } = useWishlist();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case "VIP":
        return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
      case "Enterprise":
        return "bg-indigo-500/15 text-indigo-300 ring-indigo-500/30";
      case "Pro":
        return "bg-cyan-500/15 text-cyan-300 ring-cyan-500/30";
      default:
        return "bg-slate-800 text-slate-300 ring-slate-700";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "NP";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090d16]">
                <svg className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider text-white group-hover:text-indigo-200 transition-colors">
                NEXPHONE
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                Hardware Enclave
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 pl-4">
            <Link
              href={ROUTES.PRODUCTS.ROOT}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Flagships
            </Link>
            <Link
              href={`${ROUTES.PRODUCTS.ROOT}?series=Foldable`}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Foldables
            </Link>
            <Link
              href={`${ROUTES.PRODUCTS.ROOT}?series=Enterprise`}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Enterprise Fleet
            </Link>
            <Link
              href={ROUTES.EXPERIENCE_3D}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>3D Studio</span>
            </Link>
            <Link
              href={ROUTES.COMPARE}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <span>Compare</span>
              {totalCompare > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/30">
                  {totalCompare}
                </span>
              )}
            </Link>
            <Link
              href="/#deals-section"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors"
            >
              Special Deals
            </Link>
          </div>
        </div>

        {/* Right Actions / Auth Menu */}
        <div className="flex items-center gap-3">
          {/* Wishlist Trigger */}
          <Link
            href={ROUTES.WISHLIST}
            className="relative flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-slate-800/80 border border-slate-800 bg-slate-900/60 transition-all focus:outline-none"
            aria-label="View favorites and wishlist"
            title="Wishlist / Favorites"
          >
            <svg
              className={`w-5 h-5 transition-colors ${
                totalWishlist > 0 ? "text-rose-400 fill-rose-500/20" : "text-slate-300"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {totalWishlist > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md shadow-rose-500/40 animate-pulse">
                {totalWishlist}
              </span>
            )}
          </Link>

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 bg-slate-900/60 transition-all focus:outline-none"
            aria-label="View shopping cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-black text-slate-950 shadow-md shadow-cyan-400/40 animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-800/80" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 pr-3 hover:border-slate-700 transition-all focus:outline-none"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/30 text-xs font-bold text-indigo-300 ring-1 ring-indigo-500/40">
                  {getInitials(user.name)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <span
                    className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-1 ${getTierColor(
                      user.tier
                    )}`}
                  >
                    {user.tier} Account
                  </span>
                </div>
                <svg
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-black/40 z-50">
                  <div className="p-3 border-b border-slate-800/80">
                    <p className="text-xs font-medium text-slate-400">Signed in as</p>
                    <p className="text-xs font-bold text-white truncate mt-0.5">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{user.customerNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${getTierColor(
                          user.tier
                        )}`}
                      >
                        {user.tier}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href={ROUTES.ACCOUNT.PROFILE}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                    >
                      <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      <span>Customer Profile</span>
                    </Link>

                    <Link
                      href={ROUTES.ORDERS.ROOT}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                    >
                      <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Orders & Pre-orders</span>
                    </Link>

                    <Link
                      href={ROUTES.AUTH.FORGOT_PASSWORD}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                    >
                      <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                      <span>Security & Password</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsDropdownOpen(false);
                        await logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.AUTH.LOGIN}
                className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:brightness-110 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#090d16] px-4 py-3 space-y-2">
          <Link
            href={ROUTES.PRODUCTS.ROOT}
            onClick={() => setIsMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            All Flagships
          </Link>
          <Link
            href={`${ROUTES.PRODUCTS.ROOT}?series=Foldable`}
            onClick={() => setIsMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Foldables
          </Link>
          <Link
            href={`${ROUTES.PRODUCTS.ROOT}?series=Enterprise`}
            onClick={() => setIsMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Enterprise Fleet
          </Link>
          <Link
            href={ROUTES.EXPERIENCE_3D}
            onClick={() => setIsMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-slate-800 flex items-center justify-between"
          >
            <span>3D Studio</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              360°
            </span>
          </Link>
          <Link
            href={ROUTES.COMPARE}
            onClick={() => setIsMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center justify-between"
          >
            <span>Compare Phones</span>
            {totalCompare > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                {totalCompare}/3
              </span>
            )}
          </Link>
          <Link
            href={ROUTES.WISHLIST}
            onClick={() => setIsMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-xs font-medium text-rose-300 hover:bg-slate-800 flex items-center justify-between"
          >
            <span>Wishlist & Favorites</span>
            {totalWishlist > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                {totalWishlist}
              </span>
            )}
          </Link>
          <Link
            href="/#deals-section"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-xs font-medium text-cyan-400 hover:bg-slate-800"
          >
            Special Deals
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

