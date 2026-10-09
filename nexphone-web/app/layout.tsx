import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CompareBar } from "@/components/compare/CompareBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexPhone | Next-Gen Satellite & Hardware Enclave Flagships",
  description: "Experience ultra-secure commercial communication devices, dual hardware enclaves, satellite VoIP, and titanium engineering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}
    >
      <body className="min-h-full flex flex-col bg-[#080c14] text-slate-100">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                {children}
                <CartDrawer />
                <Suspense fallback={null}>
                  <CompareBar />
                </Suspense>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
