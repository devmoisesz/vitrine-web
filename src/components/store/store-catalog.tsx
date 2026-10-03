"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryChips } from "@/features/catalog/components/category-chips";
import { Pagination } from "@/features/catalog/components/pagination";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { useStoreProducts } from "@/features/store/hooks/use-store-products";

export function StoreCatalog({ slug, basePath }: { slug: string; basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);
  const parsed = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const query = { name: searchParams.get("name") || undefined, categoryId: searchParams.get("categoryId") || undefined, subcategoryId: searchParams.get("subcategoryId") || undefined, page };
  const products = useStoreProducts(slug, query);
  const hasFilters = Boolean(query.name || query.categoryId || query.subcategoryId);
  function search(form: FormData) {
    const next = new URLSearchParams(searchParams.toString());
    const name = String(form.get("name") || "").trim();
    if (name) next.set("name", name); else next.delete("name");
    next.delete("page");
    router.push(`${basePath}${next.size ? `?${next}` : ""}#catalogo`, { scroll:false });
  }
  return <section id="catalogo" className="vw-local-section vw-catalog" aria-labelledby="catalog-title">
    <div className="vw-catalog-header"><div><span className="vw-eyebrow">NOSSA SELEÇÃO</span><h2 id="catalog-title">Conheça as peças</h2></div><form action={search}><label htmlFor="product-search" className="vw-search-label">Buscar nesta loja</label><div className="vw-search-row"><input key={`${slug}:${query.name ?? ""}`} id="product-search" name="name" type="search" defaultValue={query.name ?? ""} className="vw-search" placeholder="Qual peça você procura?" /><button className="vw-button vw-outline" type="submit">Buscar</button></div></form></div>
    <details className="vw-catalog-filters" open={Boolean(query.categoryId)}><summary>Filtrar por categoria</summary><CategoryChips key={slug} basePath={basePath} /></details>
    {hasFilters && <div className="vw-filter-summary"><span>{query.name ? `Busca por “${query.name}” nesta loja` : "Catálogo filtrado nesta loja"}</span><button className="vw-text-button" onClick={() => router.push(`${basePath}#catalogo`, { scroll:false })}>Limpar filtros</button></div>}
    <div ref={gridRef} aria-busy={products.isFetching}>
      <ProductGrid products={products.data?.data ?? []} isLoading={products.isLoading} isError={products.isError} searchTerm={query.name} onRetry={() => void products.refetch()} onClearFilters={() => router.push(`${basePath}#catalogo`, { scroll:false })} emptyMessage={hasFilters ? undefined : "Esta loja ainda não tem produtos nesta página."} showClearFilters={hasFilters} />
      {!products.isLoading && !products.isError && ((products.data?.data.length ?? 0) > 0 || page > 1) && <Pagination currentPage={page} itemsInCurrentPage={products.data?.data.length ?? 0} totalCount={products.data?.totalCount} gridRef={gridRef} basePath={basePath} />}
    </div>
  </section>;
}
