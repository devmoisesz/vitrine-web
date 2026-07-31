"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StoreOrdersTable } from "@/components/painel/store-orders-table";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useStoreProfile } from "@/features/painel/hooks/use-store-profile";

export default function PainelPedidosPage() {
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const profile = useStoreProfile(accessToken);
  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const slug = profile.data?.store_slug;

  if (profile.isLoading) return <div className="mx-auto max-w-6xl"><div className="h-10 w-52 animate-pulse rounded bg-gray-200" /></div>;
  if (profile.isError || !accessToken || !slug) return <div className="mx-auto max-w-6xl rounded-xl border border-red-200 bg-red-50 p-6"><p className="text-sm text-red-700">Não foi possível identificar a loja vinculada à sua conta.</p><Button className="mt-4" variant="secondary" onClick={() => void profile.refetch()}>Tentar novamente</Button></div>;

  return <div className="mx-auto max-w-6xl space-y-8"><header><p className="eyebrow text-gray-500">{profile.data?.store_name ?? "Painel da loja"}</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Pedidos</h1><p className="mt-3 text-sm text-gray-500">Histórico interno dos pedidos recebidos pela loja.</p></header><StoreOrdersTable slug={slug} page={page} accessToken={accessToken} /></div>;
}
