export default function DevicesLoading() {
  return (
    <div className="space-y-6 p-6 md:p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-slate-800" />
          <div className="h-4 w-72 rounded-lg bg-slate-800/60" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-slate-800" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="space-y-4">
          <div className="h-8 w-full rounded-lg bg-slate-800/80" />
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-12 w-full rounded-lg bg-slate-800/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
