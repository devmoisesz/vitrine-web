"use client";

import Link from "next/link";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

import { OrderItemRow } from "@/components/orders/order-item-row";
import { OrderSummary } from "@/components/orders/order-summary";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useOrder } from "@/features/orders/hooks/use-order";

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse bg-muted" />
      <div className="h-72 animate-pulse bg-muted" />
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const order = useOrder(orderId, accessToken);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?next=/pedidos/${orderId}`);
    }
  }, [authLoading, isAuthenticated, orderId, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
          <OrderDetailSkeleton />
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
        <Link href="/pedidos" className="text-sm text-muted-foreground underline underline-offset-4">
          Voltar para meus pedidos
        </Link>

        {order.isLoading ? (
          <div className="mt-8"><OrderDetailSkeleton /></div>
        ) : order.isError || !order.data ? (
          <div className="mt-8 border border-dashed border-border p-8 text-center">
            <h1 className="font-display text-xl font-semibold">
              Não foi possível encontrar este pedido
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ele pode não existir ou não estar mais disponível.
            </p>
            <Link
              href="/pedidos"
              className="mt-6 inline-block bg-foreground px-5 py-2 text-sm text-background"
            >
              Voltar para meus pedidos
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <OrderSummary createdAt={order.data.createdAt} total={order.data.total} />
            </div>
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold">Itens do pedido</h2>
              <ul className="mt-4">
                {order.data.order_items.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
            <footer className="mt-8">
              <OrderSummary
                createdAt={order.data.createdAt}
                total={order.data.total}
                compact
              />
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
