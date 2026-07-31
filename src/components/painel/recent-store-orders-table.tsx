"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format-price";
import { useRecentStoreOrders } from "@/features/painel/hooks/use-recent-store-orders";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

export function RecentStoreOrdersTable({ slug, accessToken }: { slug?: string; accessToken: string | null }) {
  const { data, isLoading, isError, refetch } = useRecentStoreOrders(slug, accessToken);

  return <section className="rounded-xl border border-gray-200 bg-white">
    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4"><h2 className="font-serif text-2xl">Últimos pedidos recebidos</h2><Link href="/painel/pedidos" className="text-sm font-medium underline underline-offset-4">Ver todos</Link></div>
    {isLoading ? <div className="space-y-px p-5">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="grid grid-cols-2 gap-8 border-b border-gray-100 py-4"><div className="h-4 animate-pulse rounded bg-gray-200" /><div className="h-4 animate-pulse rounded bg-gray-200" /></div>)}</div> : null}
    {isError ? <div className="px-5 py-10 text-center"><p className="text-sm text-gray-500">Não foi possível carregar os pedidos.</p><Button variant="secondary" size="sm" className="mt-4" onClick={() => refetch()}>Tentar novamente</Button></div> : null}
    {!isLoading && !isError && data?.length === 0 ? <p className="px-5 py-10 text-center text-sm text-gray-500">Nenhum pedido recebido ainda.</p> : null}
    {!isLoading && !isError && data && data.length > 0 ? <div className="overflow-x-auto"><table className="w-full min-w-120 text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3 font-medium">Data</th><th className="px-5 py-3 font-medium">Valor total</th></tr></thead><tbody>{data.map((order) => <tr key={order.id} className="border-t border-gray-200"><td className="px-5 py-4 text-gray-500">{formatDate(order.createdAt)}</td><td className="px-5 py-4 font-medium">{formatPrice(order.total)}</td></tr>)}</tbody></table></div> : null}
  </section>;
}
