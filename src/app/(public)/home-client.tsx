"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StoreBlocksList } from "@/components/home/store-blocks-list";
import { CategorySidebar } from "@/features/catalog/components/category-sidebar";
import { CategoryChips } from "@/features/catalog/components/category-chips";
import { Pagination } from "@/features/catalog/components/pagination";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { useCategories } from "@/features/catalog/hooks/use-categories";
import { useProducts } from "@/features/catalog/hooks/use-products";
import type { CategoryWithSubcategories, ProductsPage, ProductsQueryParams } from "@/types/catalog";
import type { HomeStoresPage } from "@/types/home";

interface HomeClientProps {
  initialCategories: CategoryWithSubcategories[];
  queryParams: ProductsQueryParams;
  initialProducts?: ProductsPage;
  initialStores?: HomeStoresPage;
}

export function HomeClient({ initialCategories, queryParams, initialProducts, initialStores }: HomeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousMode = useRef<boolean | null>(null);
  const hasFilters = Boolean(queryParams.name || queryParams.categoryId || queryParams.subcategoryId);
  const products = useProducts(queryParams, initialProducts);

  useCategories(initialCategories);

  useEffect(() => {
    if (previousMode.current !== null && previousMode.current !== hasFilters) {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    previousMode.current = hasFilters;
  }, [hasFilters]);

  const activeSearch = searchParams.get("name") ?? undefined;
  const totalProducts = products.data?.data.length ?? 0;

  return <div className="flex min-h-screen flex-col bg-background"><Header /><main className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12"><section className="mb-10 max-w-2xl"><p className="eyebrow text-muted-foreground">Catálogo</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">{hasFilters ? activeSearch ? `Resultados para “${activeSearch}”` : "Explore nosso catálogo" : "Descubra lojas e produtos"}</h1><p className="mt-3 text-base text-muted-foreground md:text-lg">{hasFilters ? "Descubra produtos curados de diversas lojas em um só lugar, com filtros simples para encontrar exatamente o que você procura." : "Conheça as lojas da Vitrine Web e explore seus produtos mais recentes."}</p>{activeSearch && <button type="button" onClick={() => router.push("/")} className="mt-4 w-fit text-sm text-muted-foreground underline underline-offset-4">Limpar busca</button>}</section><div className="mb-6 md:hidden"><CategoryChips /></div><div className="flex gap-10"><aside className="hidden w-60 shrink-0 md:block"><div className="sticky top-24"><CategorySidebar /></div></aside><div ref={contentRef} className="min-w-0 flex-1">{hasFilters ? products.isError ? <div className="flex min-h-[40vh] flex-col items-center justify-center border border-dashed border-border px-6 text-center"><p className="font-display text-lg">Não foi possível carregar o catálogo</p><p className="mt-1 text-sm text-muted-foreground">Tente novamente em instantes.</p><button type="button" onClick={() => void products.refetch()} className="mt-4 bg-foreground px-5 py-2 text-sm text-background">Tentar novamente</button></div> : <><ProductGrid products={products.data?.data ?? []} isLoading={products.isLoading} isError={false} searchTerm={activeSearch} onRetry={products.refetch} onClearFilters={() => router.push("/")} />{totalProducts > 0 && <Pagination currentPage={queryParams.page} itemsInCurrentPage={totalProducts} totalCount={products.data?.totalCount} gridRef={contentRef} />}</> : <><StoreBlocksList page={queryParams.page} initialData={initialStores!} />{initialStores && initialStores.data.length > 0 && <Pagination currentPage={queryParams.page} itemsInCurrentPage={initialStores.data.length} totalCount={initialStores.totalCount} gridRef={contentRef} pageSize={5} />}</>}</div></div></main></div>;
}
