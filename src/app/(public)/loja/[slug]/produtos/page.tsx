"use client";

import { use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StoreProductsBar } from "@/components/store/store-products-bar";
import { CategoryChips } from "@/features/catalog/components/category-chips";
import { CategorySidebar } from "@/features/catalog/components/category-sidebar";
import { Pagination } from "@/features/catalog/components/pagination";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { useStoreProducts } from "@/features/store/hooks/use-store-products";
import { useStoreProfile } from "@/features/store/hooks/use-store-profile";

export default function StoreProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); const router = useRouter(); const searchParams = useSearchParams(); const gridRef = useRef<HTMLDivElement>(null); const pageValue = Number.parseInt(searchParams.get("page") ?? "1", 10); const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1; const query = { name: searchParams.get("name") ?? undefined, categoryId: searchParams.get("categoryId") ?? undefined, subcategoryId: searchParams.get("subcategoryId") ?? undefined, page }; const profile = useStoreProfile(slug); const products = useStoreProducts(slug, query); const basePath = `/loja/${slug}/produtos`; const hasFilters = Boolean(query.name || query.categoryId || query.subcategoryId);
  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12">{profile.data && <StoreProductsBar store={profile.data} slug={slug} />}<div className="mb-6 md:hidden"><CategoryChips basePath={basePath} /></div><div className="flex gap-10"><aside className="hidden w-60 shrink-0 md:block"><div className="sticky top-24"><CategorySidebar basePath={basePath} /></div></aside><div ref={gridRef} className="min-w-0 flex-1"><ProductGrid products={products.data?.data ?? []} isLoading={products.isLoading} isError={products.isError} searchTerm={query.name} onRetry={() => void products.refetch()} onClearFilters={() => router.push(basePath)} emptyMessage={hasFilters ? undefined : "Esta loja ainda não tem produtos."} showClearFilters={hasFilters} />{(products.data?.data.length ?? 0) > 0 && <Pagination currentPage={page} itemsInCurrentPage={products.data?.data.length ?? 0} gridRef={gridRef} basePath={basePath} />}</div></div></main></div>;
}
