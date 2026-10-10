"use client";

import { Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PublicFooter } from "@/components/layout/public-footer";
import { StoreGrid } from "./store-grid";
import { StoreFilterDialog } from "./store-filter-dialog";
import { StoreSearchInput } from "./store-search-input";
import { Pagination } from "@/features/catalog/components/pagination";
import { useStoresSearch } from "@/features/store/hooks/use-stores-search";
import { useSegments } from "@/features/store/hooks/use-segments";
import { readStoreFilters, storeDiscoveryHref } from "@/lib/store-discovery";

export function StoreDirectory() {
  return <Suspense fallback={<><Header exploration /><main className="mx-auto max-w-[1400px] px-4 py-12" role="status">Carregando lojas…</main></>}><DirectoryContent /></Suspense>;
}

function DirectoryContent() {
  const router = useRouter();
  const params = useSearchParams();
  const gridRef = useRef<HTMLElement>(null);
  const { name, page, segments } = readStoreFilters(params);
  const stores = useStoresSearch({ name: name || undefined, page, segments });
  const availableSegments = useSegments();
  const hasFilters = Boolean(name || segments.length);

  function updateSearch(nextName: string, nextSegments: string[]) {
    const query = new URLSearchParams();
    if (nextName) query.set("name", nextName);
    if (nextSegments.length) query.set("segments", nextSegments.join(","));
    router.push(storeDiscoveryHref(query), { scroll: false });
  }

  return <div className="flex min-h-screen flex-col bg-background">
    <Header exploration />
    <main id="conteudo" className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-8 md:py-12">
      <section className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Explorar lojas</h1>
        <p className="mt-3 text-base text-muted-foreground md:text-lg">Conheça cada marca e escolha uma loja para explorar seu próprio catálogo.</p>
        {params.get("origem") === "busca-global" && <p role="status" className="mt-4 text-sm text-muted-foreground">A busca de produtos fica dentro de cada loja. Encontre uma loja para continuar.</p>}
        <div className="mt-8"><StoreFilterDialog selected={segments} onApply={values => updateSearch(name, values)} /></div>
        <div className="mt-4"><StoreSearchInput key={`${name}:${segments.join(",")}`} value={name} onSearch={value => updateSearch(value, segments)} /></div>
      </section>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm" aria-label="Filtros aplicados">
        {!hasFilters ? <span className="text-muted-foreground">Todas as lojas</span> : <>
          {name && <button onClick={() => updateSearch("", segments)} className="flex min-h-10 max-w-full items-center gap-2 rounded border border-border px-3 py-2"><span className="min-w-0 break-words">Busca: {name}</span><X className="size-4 shrink-0" aria-hidden="true" /><span className="sr-only">Remover busca</span></button>}
          {segments.map(slug => { const label = availableSegments.data?.find(segment => segment.slug === slug)?.name ?? slug; return <button key={slug} aria-label={`Remover filtro ${label}`} onClick={() => updateSearch(name, segments.filter(value => value !== slug))} className="flex min-h-10 max-w-full items-center gap-2 rounded border border-border px-3 py-2"><span className="min-w-0 break-words">{label}</span><X className="size-4 shrink-0" aria-hidden="true" /></button>; })}
          <button onClick={() => updateSearch("", [])} className="min-h-10 px-3 underline underline-offset-4">Limpar tudo</button>
        </>}
      </div>
      <section ref={gridRef} className="mt-8 scroll-mt-36" aria-label="Lojas participantes" aria-busy={stores.isFetching}>
        {!stores.isLoading && !stores.isError && stores.data?.totalCount !== undefined && <p role="status" className="mb-6 text-sm text-muted-foreground">{stores.data.totalCount} {stores.data.totalCount === 1 ? "loja encontrada" : "lojas encontradas"}</p>}
        <StoreGrid stores={stores.data?.data ?? []} isLoading={stores.isLoading} isError={stores.isError} searchTerm={name || undefined} hasFilters={hasFilters} onRetry={() => void stores.refetch()} onClearSearch={() => updateSearch("", [])} />
        {!stores.isLoading && !stores.isError && (Boolean(stores.data?.data.length) || page > 1) && <Pagination currentPage={page} itemsInCurrentPage={stores.data?.data.length ?? 0} totalCount={stores.data?.totalCount} gridRef={gridRef} basePath="/lojas" pageSize={20} />}
      </section>
    </main>
    <PublicFooter />
  </div>;
}
