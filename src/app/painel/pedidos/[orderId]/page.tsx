"use client";

import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/orders/order-summary";
import { OrderItemRow } from "@/components/painel/order-item-row";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useStoreOrderDetail } from "@/features/painel/hooks/use-store-order-detail";

function DetailSkeleton() {
  return <div className="space-y-6"><div className="h-28 animate-pulse rounded-xl bg-gray-200" />{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}</div>;
}

export default function PainelPedidoDetalhePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { accessToken } = useAuth();
  const order = useStoreOrderDetail(orderId, accessToken);

  return <div className="mx-auto max-w-3xl"><Link href="/painel/pedidos" className="text-sm font-medium underline underline-offset-4">Voltar para pedidos</Link><div className="mt-8">{order.isLoading ? <DetailSkeleton /> : order.isError || !order.data ? <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center"><h1 className="font-serif text-2xl">Não foi possível encontrar este pedido</h1><p className="mt-2 text-sm text-gray-500">Ele pode não existir ou não estar disponível para sua loja.</p><Link href="/painel/pedidos"><Button className="mt-6">Voltar para pedidos</Button></Link></div> : <><OrderSummary createdAt={order.data.createdAt} total={order.data.total} /><section className="mt-8"><h2 className="font-serif text-2xl">Itens do pedido</h2><ul className="mt-4 rounded-xl border border-gray-200 bg-white px-5">{order.data.order_items.map((item) => <OrderItemRow key={item.id} item={item} />)}</ul></section><footer className="mt-8"><OrderSummary createdAt={order.data.createdAt} total={order.data.total} compact /></footer></>}</div></div>;
}
