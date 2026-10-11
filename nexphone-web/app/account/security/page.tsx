import { Suspense } from "react";
import type { Metadata } from "next";
import { SecurityPageClient } from "@/components/account";

export const metadata: Metadata = {
  title: "Security & Password | NexPhone",
  description: "Change your NexPhone account password and review security settings.",
};

export default function SecurityPage() {
  return (
    <Suspense fallback={null}>
      <SecurityPageClient />
    </Suspense>
  );
}
