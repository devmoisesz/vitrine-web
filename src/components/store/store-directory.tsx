"use client";

import Link from "next/link";
import { Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StoreGrid } from "./store-grid";
import { StoreBanner } from "./store-banner";
import { StoreSearchInput } from "./store-search-input";
import { Pagination } from "@/features/catalog/components/pagination";
import { useStoresSearch } from "@/features/store/hooks/use-stores-search";

export function StoreDirectory({ catalogue = false }: { catalogue?: boolean }) {
  return <Suspense fallback={<><Header /><main className="mx-auto max-w-[1400px] px-4 py-12" role="status">Carregando lojas…</main></>}>
    <DirectoryContent catalogue={catalogue} />
  </Suspense>;
}

function DirectoryContent({ catalogue }: { catalogue: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const gridRef = useRef<HTMLElement>(null);
  const name = params.get("name") ?? "";
  const parsedPage = Number.parseInt(params.get("page") ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const stores = useStoresSearch({ name: name || undefined, page });
  const basePath = catalogue ? "/catalogo" : "/lojas";

  function setSearch(next: string) {
    const query = new URLSearchParams();
    if (next) query.set("name", next);
    router.push(`${basePath}${query.size ? `?${query}` : ""}`);
  }

  const showBanners = catalogue && !stores.isLoading && !stores.isError && Boolean(stores.data?.data.length);
  return <div className="min-h-screen bg-background">
    <Header />
    <main id="conteudo" className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
      <section className={catalogue ? "" : "mx-auto max-w-2xl"}>
        <p className="eyebrow text-muted-foreground">{catalogue ? "Catálogo" : "Lojas"}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">{catalogue ? "Descubra as lojas" : "Encontre uma loja"}</h1>
        <p className="mt-3 text-base text-muted-foreground md:text-lg">Escolha uma loja para explorar seu catálogo de produtos.</p>
        {params.get("origem") === "busca-global" && <p role="status" className="mt-4 text-sm text-muted-foreground">A busca de produtos fica dentro de cada loja. Encontre uma loja para continuar.</p>}
        <div className="mt-8 max-w-2xl"><StoreSearchInput key={name} value={name} onSearch={setSearch} /></div>
      </section>
      <section ref={gridRef} className="mt-10" aria-label="Lojas participantes">
        {showBanners ? <div className="space-y-14">{stores.data!.data.map(store => <article key={store.id}>
          <StoreBanner bannerUrl={store.bannerUrl ?? null} logoUrl={store.logo_image_url} storeName={store.name} href={`/loja/${store.slug}/produtos`} />
          <Link href={`/loja/${store.slug}/produtos`} className="mt-3 inline-block font-display text-2xl font-semibold hover:underline">{store.name}</Link>
          {store.description && <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">{store.description}</p>}
          <Link href={`/loja/${store.slug}/produtos`} className="mt-5 block w-fit border border-foreground px-5 py-2.5 text-sm font-medium hover:bg-muted">Acessar catálogo de {store.name} →</Link>
        </article>)}</div> : <StoreGrid stores={stores.data?.data ?? []} isLoading={stores.isLoading} isError={stores.isError} searchTerm={name || undefined} onRetry={() => void stores.refetch()} onClearSearch={() => setSearch("")} />}
        {!stores.isLoading && !stores.isError && (Boolean(stores.data?.data.length) || page > 1) && <Pagination currentPage={page} itemsInCurrentPage={stores.data?.data.length ?? 0} totalCount={stores.data?.totalCount} gridRef={gridRef} basePath={basePath} pageSize={20} />}
      </section>
    </main>
  </div>;
}
