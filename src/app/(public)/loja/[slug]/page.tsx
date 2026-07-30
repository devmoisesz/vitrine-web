"use client";

import Link from "next/link";
import { use } from "react";
import { Header } from "@/components/layout/header";
import { StoreHeader } from "@/components/store/store-header";
import { Button } from "@/components/ui/button";
import { useStoreProfile } from "@/features/store/hooks/use-store-profile";

function StoreSkeleton() { return <div className="mx-auto max-w-2xl text-center"><div className="mx-auto size-28 animate-pulse rounded-full bg-muted" /><div className="mx-auto mt-5 h-9 w-56 animate-pulse bg-muted" /><div className="mx-auto mt-5 h-20 w-full animate-pulse bg-muted" /></div>; }

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); const store = useStoreProfile(slug); const status = (store.error as { status?: number } | null)?.status;
  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-4xl px-4 py-12 md:px-8">{store.isLoading ? <StoreSkeleton /> : store.isError || !store.data ? <div className="border border-dashed border-border p-10 text-center"><h1 className="font-display text-2xl font-semibold">{status === 404 ? "Loja não encontrada" : "Não foi possível carregar esta loja"}</h1><p className="mt-2 text-sm text-muted-foreground">{status === 404 ? "Esta loja pode estar inativa ou não existir." : "Tente novamente em instantes."}</p>{status === 404 ? <Link href="/" className="mt-6 inline-block bg-foreground px-5 py-2 text-sm text-background">Voltar para o catálogo</Link> : <Button className="mt-6" onClick={() => void store.refetch()}>Tentar novamente</Button>}</div> : <StoreHeader store={store.data} slug={slug} />}</main></div>;
}
