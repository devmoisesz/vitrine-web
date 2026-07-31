"use client";

import Link from "next/link";
import { useRef } from "react";
import { Pagination } from "@/features/catalog/components/pagination";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format-price";
import { useStoreOrders } from "@/features/painel/hooks/use-store-orders";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "—"
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

interface StoreOrdersTableProps {
  slug: string;
  page: number;
  accessToken: string;
}

export function StoreOrdersTable({ slug, page, accessToken }: StoreOrdersTableProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const orders = useStoreOrders(slug, page, accessToken);
  const items = orders.data ?? [];

  if (orders.isLoading) {
    return <div className="overflow-hidden rounded-xl border border-gray-200 bg-white"><div className="grid grid-cols-3 gap-6 border-b border-gray-200 bg-gray-50 px-5 py-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-4 animate-pulse rounded bg-gray-200" />)}</div>{Array.from({ length: 5 }).map((_, index) => <div key={index} className="grid grid-cols-3 gap-6 border-b border-gray-100 px-5 py-5">{Array.from({ length: 3 }).map((_, cellIndex) => <div key={cellIndex} className="h-4 animate-pulse rounded bg-gray-100" />)}</div>)}</div>;
  }

  if (orders.isError) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center"><p className="text-sm text-red-700">Não foi possível carregar os pedidos.</p><Button variant="secondary" className="mt-4" onClick={() => void orders.refetch()}>Tentar novamente</Button></div>;
  }

  if (items.length === 0) {
    return <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center"><p className="text-gray-600">Nenhum pedido recebido ainda.</p></div>;
  }

  return <div ref={listRef}><div className="overflow-x-auto rounded-xl border border-gray-200 bg-white"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-gray-200 bg-gray-50 text-gray-500"><tr><th className="px-5 py-3 font-medium">Data</th><th className="px-5 py-3 font-medium">Valor total</th><th className="px-5 py-3 text-right font-medium">Ações</th></tr></thead><tbody>{items.map((order) => <tr key={order.id} className="border-b border-gray-100 last:border-0"><td className="px-5 py-4 text-gray-600">{formatDate(order.createdAt)}</td><td className="px-5 py-4 font-medium">{formatPrice(order.total)}</td><td className="px-5 py-4 text-right"><Link href={`/painel/pedidos/${order.id}`} className="text-sm font-medium underline underline-offset-4">Ver detalhes</Link></td></tr>)}</tbody></table></div><Pagination currentPage={page} itemsInCurrentPage={items.length} gridRef={listRef} basePath="/painel/pedidos" /></div>;
}
