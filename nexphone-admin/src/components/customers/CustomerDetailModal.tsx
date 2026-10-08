"use client";

import { useEffect, useState } from "react";
import type { Customer, CustomerTier } from "@/types/customer";
import { cn } from "@/utils/cn";

interface CustomerDetailModalProps {
  readonly customer: Customer | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onToggleStatus: (customer: Customer) => void;
}

function getTierBadge(tier: CustomerTier) {
  switch (tier) {
    case "VIP":
      return {
        label: "VIP Partner",
        className: "border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300",
        icon: "★",
      };
    case "Enterprise":
      return {
        label: "Enterprise",
        className: "border-indigo-500/40 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300",
        icon: "◆",
      };
    case "Pro":
      return {
        label: "Pro Fleet",
        className: "border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-sky-500/10 text-cyan-300",
        icon: "▲",
      };
    case "Regular":
    default:
      return {
        label: "Regular",
        className: "border-slate-700/60 bg-slate-800/40 text-slate-300",
        icon: "●",
      };
  }
}

function getAvatarGradient(name: string) {
  const gradients = [
    "from-indigo-600 to-purple-600",
    "from-cyan-600 to-blue-600",
    "from-emerald-600 to-teal-600",
    "from-amber-600 to-orange-600",
    "from-rose-600 to-pink-600",
    "from-violet-600 to-fuchsia-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
  onToggleStatus,
}: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const tier = getTierBadge(customer.tier);
  const initials = getInitials(customer.name);
  const avatarBg = getAvatarGradient(customer.name);
  const isActive = customer.status === "active";
  const recentOrders = customer.recentOrders ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl z-10 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Accent Top Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-white shadow-lg text-lg border border-white/10",
                  avatarBg
                )}
              >
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {customer.name}
                  </h3>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      tier.className
                    )}
                  >
                    <span>{tier.icon}</span>
                    <span>{tier.label}</span>
                  </span>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                      <span>Disabled</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                  <span>{customer.customerNumber}</span>
                  {customer.company && (
                    <>
                      <span>•</span>
                      <span className="text-slate-300 font-sans">{customer.company}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mt-5">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Lifetime Spend</span>
              <span className="block mt-1 text-sm font-bold font-mono text-emerald-400">
                {formatCurrency(customer.metrics.totalSpent)}
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Total Orders</span>
              <span className="block mt-1 text-sm font-bold font-mono text-white">
                {customer.metrics.totalOrders} {customer.metrics.totalOrders === 1 ? "order" : "orders"}
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Avg Order Value</span>
              <span className="block mt-1 text-sm font-bold font-mono text-cyan-400">
                {formatCurrency(customer.metrics.avgOrderValue)}
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Registered</span>
              <span className="block mt-1 text-xs font-mono text-slate-300 truncate">
                {formatDate(customer.createdAt).split(",")[0]}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-5 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "pb-2.5 text-xs font-semibold transition-all border-b-2",
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              Account Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={cn(
                "pb-2.5 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5",
                activeTab === "orders"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              <span>Order History</span>
              <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
                {recentOrders.length}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-5 text-xs">
          {activeTab === "overview" ? (
            <>
              {/* Account Alert if Disabled */}
              {!isActive && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-rose-200">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Account Is Currently Disabled</span>
                  </div>
                  <p className="text-slate-300">
                    <strong>Reason:</strong> {customer.disabledReason || "Administrative restriction"}
                  </p>
                  {customer.disabledAt && (
                    <p className="text-[11px] text-slate-400 font-mono">
                      Disabled on {formatDate(customer.disabledAt)} by {customer.disabledBy || "Administrator"}
                    </p>
                  )}
                </div>
              )}

              {/* Contact & Address Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Information */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                    Contact Details
                  </span>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium text-white">{customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone</span>
                      <span className="font-mono text-white">{customer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Company</span>
                      <span className="text-slate-200">{customer.company || "Individual Account"}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                    Default Address
                  </span>
                  <div className="text-slate-300 leading-relaxed">
                    <p className="font-semibold text-white">{customer.address.street}</p>
                    <p>
                      {customer.address.city}, {customer.address.state} {customer.address.postalCode}
                    </p>
                    <p className="text-slate-400">{customer.address.country}</p>
                  </div>
                </div>
              </div>

              {/* Security & Verification Metadata */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                  Account Security & Session Telemetry
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", customer.security.emailVerified ? "bg-emerald-400" : "bg-slate-600")} />
                    <span className="text-slate-300">
                      {customer.security.emailVerified ? "Email Verified" : "Email Unverified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", customer.security.phoneVerified ? "bg-emerald-400" : "bg-slate-600")} />
                    <span className="text-slate-300">
                      {customer.security.phoneVerified ? "Phone Verified" : "Phone Unverified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", customer.security.twoFactorEnabled ? "bg-emerald-400" : "bg-slate-600")} />
                    <span className="text-slate-300">
                      {customer.security.twoFactorEnabled ? "2FA Enabled" : "2FA Off"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap justify-between items-center text-[11px] text-slate-400 font-mono gap-2">
                  <span>Last Login: {formatDate(customer.security.lastLoginAt)}</span>
                  <span>IP: {customer.security.lastLoginIp}</span>
                </div>
              </div>

              {/* Internal Notes */}
              {customer.notes && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Internal Operations Notes
                  </span>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {customer.notes}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Orders Tab */
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8 text-center text-slate-500">
                  <p>No recorded orders for this customer yet.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      {recentOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-semibold text-white">
                            {ord.orderNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                            {formatDate(ord.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">
                            {formatCurrency(ord.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="capitalize text-slate-300">
                              {ord.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="capitalize text-indigo-400 font-medium">
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4 bg-slate-900/90">
          <div>
            {isActive ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onToggleStatus(customer);
                }}
                className="h-10 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-rose-200"
              >
                Disable Customer Account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onToggleStatus(customer);
                }}
                className="h-10 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
              >
                Reactivate Customer Account
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-700/60 bg-slate-800/40 px-5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
