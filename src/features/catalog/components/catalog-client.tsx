"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CategorySidebar } from "@/features/catalog/components/category-sidebar";
import { CategoryChips } from "@/features/catalog/components/category-chips";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Pagination } from "@/features/catalog/components/pagination";
import { useProducts } from "@/features/catalog/hooks/use-products";
import { useCategories } from "@/features/catalog/hooks/use-categories";
import type {
  CategoryWithSubcategories,
  ProductsPage,
  ProductsQueryParams,
} from "@/types/catalog";

interface CatalogClientProps {
  initialProducts: ProductsPage;
  initialCategories: CategoryWithSubcategories[];
  queryParams: ProductsQueryParams;
}

export function CatalogClient({
  initialProducts,
  initialCategories,
  queryParams,
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);

  useCategories(initialCategories);
  const {
    data: productsPage,
    isLoading,
    isError,
    refetch,
  } = useProducts(queryParams, initialProducts);

  function handleClearFilters() {
    router.push("/");
  }

  const totalProducts = productsPage?.data.length ?? 0;
  const activeSearch = searchParams.get("name") ?? undefined;

  return (
    <div
      data-slot="catalog-page"
      className="flex min-h-screen flex-col bg-[#faf8f4]"
    >
      <Header />
      <CategoryChips />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8 lg:px-10">
        <section className="bg-transparent p-2 sm:p-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
              Catálogo
            </p>
            <h1
              className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              Explore nosso catálogo
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
              Descubra produtos curados de diversas lojas em um só lugar, com
              filtros simples para encontrar exatamente o que você procura.
            </p>
          </div>
        </section>

        <div className="flex flex-1 gap-8">
          <CategorySidebar />

          <main className="flex-1">
            <div ref={gridRef}>
              <ProductGrid
                products={productsPage?.data ?? []}
                isLoading={isLoading}
                isError={isError}
                searchTerm={activeSearch}
                onRetry={refetch}
                onClearFilters={handleClearFilters}
              />
            </div>

            {!isLoading && !isError && totalProducts > 0 && (
              <Pagination
                currentPage={queryParams.page}
                itemsInCurrentPage={totalProducts}
                totalCount={productsPage?.totalCount}
                gridRef={gridRef}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
