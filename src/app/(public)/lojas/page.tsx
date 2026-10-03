"use client";

import { Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StoreGrid } from "@/components/store/store-grid";
import { StoreSearchInput } from "@/components/store/store-search-input";
import { Pagination } from "@/features/catalog/components/pagination";
import { useStoresSearch } from "@/features/store/hooks/use-stores-search";

export default function StoresPage() {
  return <><Header /><main id="conteudo"><section className="vw-page-intro vw-compact"><span className="vw-eyebrow">LOJAS DA VITRINE WEB</span><h1>Encontre uma loja.<br />Conheça uma marca.</h1><p className="vw-lead">Escolha uma vitrine para descobrir seus produtos e conversar diretamente com a loja.</p></section><Suspense fallback={<div className="vw-directory" role="status">Carregando lojas…</div>}><Directory /></Suspense></main></>;
}

function Directory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);
  const name = searchParams.get("name") ?? "";
  const parsed = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const stores = useStoresSearch({ name: name || undefined, page });
  function setSearch(next: string) {
    const params = new URLSearchParams();
    if (next) params.set("name", next);
    router.push(`/lojas${params.size ? `?${params}` : ""}`, { scroll: false });
  }
  return <section className="vw-directory">
    {searchParams.get("origem") === "busca-global" && <p className="vw-notice" role="status">A busca de produtos agora fica dentro de cada loja. Escolha uma vitrine para continuar.</p>}
    <StoreSearchInput key={name} value={name} onSearch={setSearch} />
    <div ref={gridRef} className="vw-directory-results" aria-busy={stores.isFetching}>
      <StoreGrid stores={stores.data?.data ?? []} isLoading={stores.isLoading} isError={stores.isError} searchTerm={name || undefined} onRetry={() => void stores.refetch()} onClearSearch={() => setSearch("")} />
      {!stores.isLoading && !stores.isError && ((stores.data?.data.length ?? 0) > 0 || page > 1) && <Pagination currentPage={page} itemsInCurrentPage={stores.data?.data.length ?? 0} totalCount={stores.data?.totalCount} gridRef={gridRef} basePath="/lojas" pageSize={20} />}
    </div>
    <p className="vw-caption">Lojas apresentadas por ordem de cadastro na plataforma.</p>
  </section>;
}
