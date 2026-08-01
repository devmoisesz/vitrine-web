"use client";

import { Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StoreGrid } from "@/components/store/store-grid";
import { StoreSearchInput } from "@/components/store/store-search-input";
import { Pagination } from "@/features/catalog/components/pagination";
import { useStoresSearch } from "@/features/store/hooks/use-stores-search";

export default function StoresPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Header />
          <main className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
            <div className="h-6 w-40 animate-pulse bg-muted" />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse bg-muted" />
              ))}
            </div>
          </main>
        </div>
      }
    >
      <StoresPageContent />
    </Suspense>
  );
}

function StoresPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);
  const name = searchParams.get("name") ?? "";
  const parsedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const stores = useStoresSearch({ name: name || undefined, page });
  function setSearch(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("name", next);
    else params.delete("name");
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/lojas?${query}` : "/lojas");
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
        <section className="mx-auto max-w-2xl">
          <p className="eyebrow text-muted-foreground">Lojas</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Encontre uma loja
          </h1>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Busque pelo nome e descubra vitrines locais.
          </p>
          <div className="mt-8">
            <StoreSearchInput key={name} value={name} onSearch={setSearch} />
          </div>
        </section>
        <section ref={gridRef} className="mt-10">
          <StoreGrid
            stores={stores.data?.data ?? []}
            isLoading={stores.isLoading}
            isError={stores.isError}
            searchTerm={name || undefined}
            onRetry={() => void stores.refetch()}
            onClearSearch={() => setSearch("")}
          />
          {!stores.isLoading &&
          !stores.isError &&
          (stores.data?.data.length ?? 0) > 0 ? (
            <Pagination
              currentPage={page}
              itemsInCurrentPage={stores.data?.data.length ?? 0}
              gridRef={gridRef}
              basePath="/lojas"
            />
          ) : null}
        </section>
      </main>
    </div>
  );
}
