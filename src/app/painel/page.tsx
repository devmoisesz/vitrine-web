"use client";

import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/painel/metric-card";
import { PainelShortcutCard } from "@/components/painel/painel-shortcut-card";
import { RecentStoreOrdersTable } from "@/components/painel/recent-store-orders-table";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useStoreMetrics } from "@/features/painel/hooks/use-store-metrics";
import { useStoreProfile } from "@/features/painel/hooks/use-store-profile";
import { useRecentStoreOrders } from "@/features/painel/hooks/use-recent-store-orders";

export default function PainelDashboardPage() {
  const { accessToken } = useAuth();
  const profile = useStoreProfile(accessToken);
  const slug = profile.data?.store_slug;
  const metrics = useStoreMetrics(slug, accessToken);
  const orders = useRecentStoreOrders(slug, accessToken);
  const isLoading = profile.isLoading || metrics.isLoading || orders.isLoading;
  const isError = profile.isError || metrics.isError || orders.isError;

  function retry() {
    void profile.refetch();
    void metrics.refetch();
    void orders.refetch();
  }

  return <div className="mx-auto max-w-6xl space-y-8">
    <header><p className="eyebrow text-gray-500">{profile.data?.store_name ?? "Painel do lojista"}</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Dashboard</h1></header>
    {isError && !isLoading ? <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center"><p className="text-sm text-gray-500">Não foi possível carregar o painel.</p><Button variant="secondary" size="sm" className="mt-4" onClick={retry}>Tentar novamente</Button></div> : <>
      <section className="grid gap-4 sm:grid-cols-2" aria-label="Métricas da loja">
        <MetricCard label="Produtos ativos">{isLoading ? <span className="inline-block h-10 w-16 animate-pulse rounded bg-gray-200 align-middle" /> : (metrics.data?.length ?? 0)}</MetricCard>
        <MetricCard label="Pedidos recebidos">{isLoading ? <span className="inline-block h-10 w-16 animate-pulse rounded bg-gray-200 align-middle" /> : (orders.data?.length ?? 0)}</MetricCard>
      </section>
      <section className="grid gap-4 sm:grid-cols-2" aria-label="Atalhos"><PainelShortcutCard href="/painel/produtos/novo">+ Cadastrar produto</PainelShortcutCard><PainelShortcutCard href="/painel/produtos">Ver produtos</PainelShortcutCard></section>
      <RecentStoreOrdersTable slug={slug} accessToken={accessToken} />
    </>}
  </div>;
}
