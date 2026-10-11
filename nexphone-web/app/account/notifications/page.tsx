import { Suspense } from "react";
import type { Metadata } from "next";
import { NotificationsPageClient } from "@/components/notifications";

export const metadata: Metadata = {
  title: "Notifications | NexPhone",
  description: "Order updates, promotions and new phone alerts, plus your notification preferences.",
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={null}>
      <NotificationsPageClient />
    </Suspense>
  );
}
