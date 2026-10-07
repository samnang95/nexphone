import Link from "next/link";
import { DASHBOARD_NAV_SECTIONS } from "@/config/navigation";

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950 p-4 md:flex">
      {/* Brand */}
      <div className="flex h-12 items-center gap-3 px-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-sm">
          NX
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-white">NexPhone</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Admin Console
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="mt-6 flex flex-1 flex-col gap-6">
        {DASHBOARD_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {section.title}
            </span>
            <nav className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
                >
                  <span>{item.title}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="border-t border-slate-800/80 pt-4">
        <div className="flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200">
            AD
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-xs font-medium text-white">System Admin</span>
            <span className="truncate text-[10px] text-slate-400">admin@nexphone.io</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
