import React from "react";
import type { NotificationCategory } from "@/types/notification";

export interface CategoryMeta {
  label: string;
  description: string;
  chip: string;
  iconWrap: string;
  dot: string;
  icon: React.ReactNode;
}

const svgProps = {
  className: "w-4 h-4",
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const CATEGORY_META: Record<NotificationCategory, CategoryMeta> = {
  order: {
    label: "Order updates",
    description: "Confirmations, shipping progress, delivery and cancellations for your orders.",
    chip: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    iconWrap: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    dot: "bg-cyan-400",
    icon: (
      <svg {...svgProps}>
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  promotion: {
    label: "Promotions",
    description: "Vouchers, free-shipping weekends and member-only offers.",
    chip: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    iconWrap: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    dot: "bg-amber-400",
    icon: (
      <svg {...svgProps}>
        <path d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  new_phone: {
    label: "New phones",
    description: "Launch alerts for new handsets, finishes and pre-order windows.",
    chip: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
    iconWrap: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
    dot: "bg-indigo-400",
    icon: (
      <svg {...svgProps}>
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
};

export const CATEGORY_ORDER: NotificationCategory[] = ["order", "promotion", "new_phone"];
