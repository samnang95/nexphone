import { Suspense } from "react";
import type { Metadata } from "next";
import { ProfilePageClient } from "@/components/account";

export const metadata: Metadata = {
  title: "Customer Profile | NexPhone",
  description: "View and edit your NexPhone customer profile and contact details.",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageClient />
    </Suspense>
  );
}
