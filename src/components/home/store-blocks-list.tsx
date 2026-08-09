"use client";

import { StoreBlock } from "@/components/home/store-block";
import { StoreBlockSkeleton } from "@/components/home/store-block-skeleton";
import { useHomeStores } from "@/features/home/hooks/use-home-stores";
import type { HomeStoresPage } from "@/types/home";

export function StoreBlocksList({ page, initialData }: { page: number; initialData: HomeStoresPage }) {
  const { data, isLoading, isError, refetch } = useHomeStores(page, initialData);
  if (isLoading) return <div className="space-y-14">{Array.from({ length: 3 }).map((_, index) => <StoreBlockSkeleton key={index} />)}</div>;
  if (isError) return <div className="flex min-h-[40vh] flex-col items-center justify-center border border-dashed border-border px-6 text-center"><p className="font-display text-lg">Não foi possível carregar as lojas</p><p className="mt-1 text-sm text-muted-foreground">Tente novamente em instantes.</p><button type="button" onClick={() => void refetch()} className="mt-4 bg-foreground px-5 py-2 text-sm text-background">Tentar novamente</button></div>;
  if (!data?.data.length) return <div className="py-24 text-center text-sm text-muted-foreground">Nenhuma loja disponível no momento.</div>;
  return <div className="space-y-14">{data.data.map((store) => <StoreBlock key={store.id} store={store} />)}</div>;
}
