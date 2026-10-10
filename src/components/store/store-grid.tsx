import { Button } from "@/components/ui/button";
import type { SearchedStore } from "@/features/store/api/fetch-stores-search";
import { StoreCard } from "./store-card";

const gridClass = "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export function StoreGrid({ stores, isLoading, isError, searchTerm, hasFilters, onRetry, onClearSearch }: { stores: SearchedStore[]; isLoading: boolean; isError: boolean; searchTerm?: string; hasFilters?: boolean; onRetry: () => void; onClearSearch: () => void }) {
  if (isLoading) return <div className={gridClass} role="status" aria-label="Carregando lojas">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[3/4] animate-pulse bg-muted" />)}</div>;
  if (isError) return <div role="alert" className="border border-dashed border-border p-10 text-center"><p className="font-display text-lg">Não foi possível carregar as lojas.</p><Button className="mt-4" onClick={onRetry}>Tentar novamente</Button></div>;
  if (!stores.length) return <div role="status" className="border border-dashed border-border p-10 text-center"><p className="text-sm text-muted-foreground">{searchTerm ? `Nenhuma loja encontrada para “${searchTerm}”.` : "Nenhuma loja encontrada."}</p>{hasFilters || searchTerm ? <Button variant="secondary" className="mt-4" onClick={onClearSearch}>Limpar busca e filtros</Button> : null}</div>;
  return <div className={gridClass}>{stores.map(store => <StoreCard key={store.id} store={store} />)}</div>;
}
