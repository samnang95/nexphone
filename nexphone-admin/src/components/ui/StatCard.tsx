import type { ReactNode } from "react";
import type { TrendDirection } from "@/types/dashboard";

export interface StatCardProps {
  readonly title: string;
  readonly value: string;
  readonly changePercentage?: number;
  readonly trend?: TrendDirection;
  readonly caption?: string;
  readonly icon?: ReactNode;
}

export function StatCard({
  title,
  value,
  changePercentage,
  trend = "neutral",
  caption,
  icon,
}: StatCardProps) {
  const getTrendBadgeStyles = (direction: TrendDirection): string => {
    switch (direction) {
      case "up":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "down":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "neutral":
      default:
        return "bg-slate-700/30 text-slate-300 border-slate-700/50";
    }
  };

  const formattedChange =
    changePercentage !== undefined
      ? `${changePercentage > 0 ? "+" : ""}${changePercentage.toFixed(1)}%`
      : null;

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm transition-all duration-200 hover:border-slate-700 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {icon ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-200">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
          {value}
        </p>

        {formattedChange ? (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getTrendBadgeStyles(
              trend
            )}`}
          >
            {formattedChange}
          </span>
        ) : null}
      </div>

      {caption ? (
        <p className="mt-2 text-xs text-slate-400">
          {caption}
        </p>
      ) : null}
    </article>
  );
}
