import { Suspense } from "react";
import type { Metadata } from "next";
import { AddressesPageClient } from "@/components/account";

export const metadata: Metadata = {
  title: "Saved Addresses | NexPhone",
  description: "Manage your NexPhone delivery addresses and default shipping destination.",
};

export default function AddressesPage() {
  return (
    <Suspense fallback={null}>
      <AddressesPageClient />
    </Suspense>
  );
}
