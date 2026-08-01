"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/header";
import { StoreCartCard } from "@/components/cart/store-cart-card";
import { listCarts } from "@/features/cart/api/cart";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?next=/carrinho");
    }
  }, [isLoading, isAuthenticated, router]);

  const enabled = isAuthenticated && Boolean(accessToken);

  const {
    data: carts,
    isLoading: cartsLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["carts"],
    queryFn: () => listCarts(accessToken!),
    enabled,
  });

  const sorted = [...(carts ?? [])].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={null}><Header /></Suspense>
        <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
          <div className="h-6 w-40 animate-pulse bg-muted" />
          <div className="mt-10 flex flex-col gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-32 w-full animate-pulse bg-muted" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated — redirecting
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}><Header /></Suspense>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
        <p className="eyebrow text-muted-foreground">Suas sacolas</p>
        <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
          Meus carrinhos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Um carrinho por loja. A negociação acontece direto no WhatsApp do
          lojista.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          {cartsLoading &&
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-32 w-full animate-pulse bg-muted" />
            ))}

          {isError && (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="font-display text-lg">
                Não foi possível carregar seus carrinhos
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {(error as Error)?.message ?? "Tente novamente em instantes."}
              </p>
            </div>
          )}

          {!cartsLoading && !isError && sorted.length === 0 && (
            <div className="border border-dashed border-border p-12 text-center">
              <p className="font-display text-lg">Nenhum carrinho por aqui</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore o catálogo e adicione peças das suas lojas favoritas.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block bg-foreground px-6 py-2.5 text-sm text-background"
              >
                Ver catálogo
              </Link>
            </div>
          )}

          {sorted.map((cart) => (
            <StoreCartCard
              key={cart.id}
              cart={cart}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
