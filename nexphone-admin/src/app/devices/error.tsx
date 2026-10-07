"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface DevicesErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function DevicesError({ error, reset }: DevicesErrorProps) {
  useEffect(() => {
    // Log error to telemetry service
    console.error("Hardware fleet route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 className="mt-4 text-lg font-semibold text-white">
        Failed to load fleet telemetry
      </h2>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        An error occurred while communicating with the hardware cluster. Please try again.
      </p>

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
        <Button variant="primary" size="sm" onClick={() => reset()}>
          Retry Request
        </Button>
      </div>
    </div>
  );
}
