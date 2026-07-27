'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { CategorySidebar } from '@/features/catalog/components/category-sidebar';
import { CategoryChips } from '@/features/catalog/components/category-chips';
import { ProductGrid } from '@/features/catalog/components/product-grid';
import { Pagination } from '@/features/catalog/components/pagination';
import { useProducts } from '@/features/catalog/hooks/use-products';
import { useCategories } from '@/features/catalog/hooks/use-categories';
import type { CategoryWithSubcategories, ProductsPage, ProductsQueryParams } from '@/types/catalog';

interface CatalogClientProps {
  initialProducts: ProductsPage;
  initialCategories: CategoryWithSubcategories[];
  queryParams: ProductsQueryParams;
}

export function CatalogClient({ initialProducts, initialCategories, queryParams }: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);

  // Mantém os hooks "quentes" com o dado já vindo do servidor — evita um
  // segundo request desnecessário no primeiro carregamento.
  useCategories(initialCategories);
  const {
    data: productsPage,
    isLoading,
    isError,
    refetch,
  } = useProducts(queryParams, initialProducts);

  function handleClearFilters() {
    router.push('/');
  }

  return (
    <div data-slot="catalog-page" className="flex min-h-screen flex-col">
      <Header />
      <CategoryChips />

      <div className="flex flex-1 gap-8 px-4 py-6 md:px-8">
        <CategorySidebar />

        <main className="flex-1">
          <div ref={gridRef}>
            <ProductGrid
              products={productsPage?.data ?? []}
              isLoading={isLoading}
              isError={isError}
              searchTerm={searchParams.get('name') ?? undefined}
              onRetry={refetch}
              onClearFilters={handleClearFilters}
            />
          </div>

          {!isLoading && !isError && (productsPage?.data.length ?? 0) > 0 && (
            <Pagination
              currentPage={queryParams.page}
              itemsInCurrentPage={productsPage?.data.length ?? 0}
              totalCount={productsPage?.totalCount}
              gridRef={gridRef}
            />
          )}
        </main>
      </div>
    </div>
  );
}
