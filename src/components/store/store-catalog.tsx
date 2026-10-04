"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryChips } from "@/features/catalog/components/category-chips";
import { CategorySidebar } from "@/features/catalog/components/category-sidebar";
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
    router.push(`${basePath}${next.size ? `?${next}` : ""}#catalogo`, { scroll: false });
  }
  function clearFilters() { router.push(`${basePath}#catalogo`, { scroll: false }); }
  return <section id="catalogo" aria-label="Catálogo de produtos da loja" className="scroll-mt-36">
    <form action={search} className="mb-8 max-w-xl">
      <label htmlFor="product-search" className="mb-2 block text-sm font-medium">Buscar produtos nesta loja</label>
      <div className="flex gap-3">
        <input key={`${slug}:${query.name ?? ""}`} id="product-search" name="name" type="search" defaultValue={query.name ?? ""} placeholder="Qual produto você procura?" className="min-w-0 flex-1 border-b border-foreground/30 bg-transparent px-1 py-3 text-sm outline-none focus:border-foreground" />
        <button className="bg-foreground px-5 py-2 text-sm text-background" type="submit">Buscar</button>
      </div>
    </form>
    <div className="mb-6 md:hidden"><CategoryChips basePath={basePath} /></div>
    <div className="flex gap-10">
      <aside className="hidden w-60 shrink-0 md:block"><div className="sticky top-36"><CategorySidebar key={slug} basePath={basePath} /></div></aside>
      <div ref={gridRef} className="min-w-0 flex-1 scroll-mt-36" aria-busy={products.isFetching}>
        {hasFilters && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm"><span>{query.name ? `Busca por “${query.name}” nesta loja` : "Produtos filtrados nesta loja"}</span><button className="underline underline-offset-4" onClick={clearFilters}>Limpar filtros</button></div>}
        <ProductGrid products={products.data?.data ?? []} isLoading={products.isLoading} isError={products.isError} searchTerm={query.name} onRetry={() => void products.refetch()} onClearFilters={clearFilters} emptyMessage={hasFilters ? undefined : "Esta loja ainda não tem produtos nesta página."} showClearFilters={hasFilters} />
        {!products.isLoading && !products.isError && ((products.data?.data.length ?? 0) > 0 || page > 1) && <Pagination currentPage={page} itemsInCurrentPage={products.data?.data.length ?? 0} totalCount={products.data?.totalCount} gridRef={gridRef} basePath={basePath} />}
      </div>
    </div>
  </section>;
}
