import type { SearchedStore } from "@/features/store/api/fetch-stores-search";
import { StoreCard } from "./store-card";

export function StoreGrid({ stores, isLoading, isError, searchTerm, onRetry, onClearSearch }: { stores: SearchedStore[]; isLoading: boolean; isError: boolean; searchTerm?: string; onRetry: () => void; onClearSearch: () => void }) {
  if (isLoading) return <div className="vw-store-grid" role="status" aria-label="Carregando lojas">{[0,1].map(i => <div key={i} className="h-80 animate-pulse rounded-md bg-muted" />)}</div>;
  if (isError) return <div className="vw-empty" role="alert"><p>Não foi possível carregar as lojas.</p><button className="vw-button" onClick={onRetry}>Tentar novamente</button></div>;
  if (!stores.length) return <div className="vw-empty" role="status"><p>{searchTerm ? `Nenhuma loja encontrada para “${searchTerm}”.` : "Nenhuma loja encontrada nesta página."}</p>{searchTerm && <button className="vw-button vw-outline" onClick={onClearSearch}>Limpar busca</button>}</div>;
  return <div className="vw-store-grid">{stores.map(store => <StoreCard key={store.id} store={store} />)}</div>;
}
