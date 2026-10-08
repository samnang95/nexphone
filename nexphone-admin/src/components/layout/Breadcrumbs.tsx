"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBreadcrumbs } from "@/routes";

interface BreadcrumbsProps {
  customCrumbs?: { label: string; href?: string }[];
}

function BreadcrumbsContent({ customCrumbs }: BreadcrumbsProps) {
  const pathname = usePathname();
  const crumbs = customCrumbs || getBreadcrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <div key={crumb.href || `${crumb.label}-${idx}`} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-slate-600">/</span>}
            {isLast || !crumb.href ? (
              <span className="font-medium text-slate-200">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-indigo-400 hover:underline"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Breadcrumbs(props: BreadcrumbsProps) {
  return (
    <Suspense fallback={<div className="h-4 w-32 bg-slate-800/40 rounded animate-pulse" />}>
      <BreadcrumbsContent {...props} />
    </Suspense>
  );
}
