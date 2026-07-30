"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { OrderCard } from "@/components/orders/order-card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/features/catalog/components/pagination";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useOrders } from "@/features/orders/hooks/use-orders";

function OrdersSkeleton() {
  return (
    <div className="mt-10 flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse bg-muted" />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const orders = useOrders(page, accessToken);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=/pedidos");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
          <OrdersSkeleton />
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) return null;

  const items = orders.data?.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
        <p className="eyebrow text-muted-foreground">Sua conta</p>
        <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
          Meus pedidos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Consulte as solicitações de compra que você enviou.
        </p>

        {orders.isLoading ? (
          <OrdersSkeleton />
        ) : orders.isError ? (
          <div className="mt-10 border border-dashed border-border p-8 text-center">
            <h2 className="font-display text-xl font-semibold">
              Não foi possível carregar seus pedidos
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tente novamente em instantes.
            </p>
            <Button className="mt-6" onClick={() => void orders.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 border border-dashed border-border p-12 text-center">
            <p className="font-display text-lg">Você ainda não fez nenhum pedido.</p>
            <Link
              href="/"
              className="mt-6 inline-block bg-foreground px-6 py-2.5 text-sm text-background"
            >
              Ir para o catálogo
            </Link>
          </div>
        ) : (
          <>
            <div ref={listRef} className="mt-10 flex flex-col gap-4">
              {items.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              itemsInCurrentPage={items.length}
              gridRef={listRef}
              basePath="/pedidos"
            />
          </>
        )}
      </main>
    </div>
  );
}
