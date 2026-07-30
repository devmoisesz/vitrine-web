import { Button } from "@/components/ui/button";
import type { SearchedStore } from "@/features/store/api/fetch-stores-search";
import { StoreCard } from "./store-card";

export function StoreGrid({ stores, isLoading, isError, searchTerm, onRetry, onClearSearch }: { stores: SearchedStore[]; isLoading: boolean; isError: boolean; searchTerm?: string; onRetry: () => void; onClearSearch: () => void }) {
  if (isLoading) return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-xl bg-muted sm:h-60" />)}</div>;
  if (isError) return <div className="border border-dashed border-border p-10 text-center"><p className="font-display text-lg">Não foi possível carregar as lojas.</p><Button className="mt-4" onClick={onRetry}>Tentar novamente</Button></div>;
  if (!stores.length) return <div className="border border-dashed border-border p-10 text-center"><p className="text-sm text-muted-foreground">{searchTerm ? `Nenhuma loja encontrada para "${searchTerm}".` : "Nenhuma loja encontrada."}</p>{searchTerm ? <Button variant="secondary" className="mt-4" onClick={onClearSearch}>Limpar busca</Button> : null}</div>;
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{stores.map((store) => <StoreCard key={store.id} store={store} />)}</div>;
}
