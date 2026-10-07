import { Badge } from "@/components/ui/Badge";
import { appConfig } from "@/config/env";
import { cn } from "@/utils/cn";

export function Header() {
  const flavorDotColor = appConfig.isProd
    ? "bg-emerald-400"
    : appConfig.isStaging
    ? "bg-amber-400"
    : "bg-indigo-400";

  const flavorTextColor = appConfig.isProd
    ? "text-emerald-400"
    : appConfig.isStaging
    ? "text-amber-400"
    : "text-indigo-400";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-slate-300">{appConfig.appName}</h2>
        <Badge variant="success">Cluster Healthy</Badge>
      </div>

      <div className="flex items-center gap-3">
        {/* Flavor indicator badge */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs">
          <span className={cn("h-2 w-2 rounded-full animate-pulse", flavorDotColor)}></span>
          <span className="text-slate-400">Flavor:</span>
          <span className={cn("font-bold uppercase tracking-wider", flavorTextColor)}>
            {appConfig.flavor}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span>Region: us-east-1</span>
        </div>
      </div>
    </header>
  );
}
