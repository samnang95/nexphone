import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { ProductDetailClient } from "@/components/product-detail/ProductDetailClient";
import { ROUTES } from "@/routes";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return [
    { id: "prod-001" },
    { id: "prod-002" },
    { id: "prod-003" },
    { id: "prod-004" },
    { id: "nexphone-pro-max-x" },
    { id: "nexphone-enterprise-edge" },
    { id: "nexphone-titanium-fold" },
    { id: "nexphone-lite" },
  ];
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await productService.getProductById(id);

  if (!product) {
    return {
      title: "Handset Not Found | NexPhone Enclave",
      description: "The requested hardware model could not be located in the fleet catalog.",
    };
  }

  return {
    title: `${product.name} | NexPhone Flagship Enclave`,
    description: product.subtitle,
    openGraph: {
      title: `${product.name} - ${product.series}`,
      description: product.subtitle,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 pb-24">
      {/* Breadcrumb Skeleton */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 py-3.5">
        <div className="max-w-7xl mx-auto px-4 flex gap-2">
          <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-4 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-4 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 aspect-square rounded-3xl bg-slate-900/50 border border-slate-800 animate-pulse" />
        <div className="lg:col-span-5 space-y-4">
          <div className="h-6 w-24 bg-slate-800 rounded-full animate-pulse" />
          <div className="h-10 w-3/4 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-16 w-full bg-slate-800/60 rounded-2xl animate-pulse" />
          <div className="h-24 w-full bg-slate-800/60 rounded-2xl animate-pulse" />
          <div className="h-12 w-full bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

async function ProductDetailLoader({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await productService.getProductById(id);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#080c14]">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-rose-400 flex items-center justify-center mb-6 shadow-2xl">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Handset Not Found in Enclave
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-md">
          The requested device identifier <code className="text-cyan-400 font-mono">[{id}]</code> does not match any active units in the repository.
        </p>
        <div className="mt-8">
          <Link
            href={ROUTES.PRODUCTS.ROOT}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25"
          >
            Browse Fleet Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Fetch all products to get related models
  const allProducts = await productService.getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailLoader params={params} />
    </Suspense>
  );
}
