"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductGallery } from "@/components/product/product-gallery";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { SizeSelector } from "@/components/product/size-selector";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { useProductDetail } from "@/features/catalog/hooks/use-product-detail";
import { formatBRL } from "@/lib/format";

function ProductSkeleton() {
  return <div className="grid gap-10 md:grid-cols-2"><div className="aspect-[3/4] animate-pulse bg-muted" /><div className="space-y-5"><div className="h-10 w-3/4 animate-pulse bg-muted" /><div className="h-5 w-1/3 animate-pulse bg-muted" /><div className="h-24 animate-pulse bg-muted" /></div></div>;
}

export default function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const { data, isLoading, isError, error, refetch } = useProductDetail(productId);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { if (!notice) return; const timeout = window.setTimeout(() => setNotice(null), 3000); return () => window.clearTimeout(timeout); }, [notice]);

  return (
    <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      {isLoading ? <ProductSkeleton /> : isError || !data ? (
        <div className="border border-dashed border-border p-10 text-center">
          <h1 className="font-display text-2xl font-semibold">{(error as { status?: number } | null)?.status === 404 ? "Produto não encontrado" : "Não foi possível carregar este produto"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{(error as { status?: number } | null)?.status === 404 ? "Este produto pode não estar mais disponível." : "Verifique sua conexão e tente novamente."}</p>
          {(error as { status?: number } | null)?.status === 404 ? <Link href="/" className="mt-6 inline-block bg-foreground px-5 py-2 text-sm text-background">Voltar para o catálogo</Link> : <Button className="mt-6" onClick={() => void refetch()}>Tentar novamente</Button>}
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-2"><ProductGallery key={data.product.id} images={data.images} productName={data.product.name} /><section>
          <Link href={`/loja/${data.product.store.slug}`} className="text-sm text-muted-foreground underline underline-offset-4">{data.product.store.name}</Link>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{data.product.name}</h1>
          <p className="mt-4 text-xl font-medium">{formatBRL(data.product.price)}</p>
          {data.product.stock <= 0 && <span className="mt-5 inline-block bg-foreground px-3 py-1 text-xs uppercase tracking-wider text-background">Indisponível</span>}
          <SizeSelector sizes={data.product.sizes} value={size} onChange={setSize} />
          <QuantitySelector value={quantity} onChange={setQuantity} />
          <AddToCartButton productId={data.product.id} quantity={quantity} size={size} requiresSize={data.product.sizes.length > 0} outOfStock={data.product.stock <= 0} onSuccess={() => setNotice("Adicionado ao carrinho") } onError={setNotice} />
          {notice && <p role="status" className="mt-3 text-sm text-muted-foreground">{notice}</p>}
          {data.product.description && <div className="mt-9 border-t border-border pt-6"><h2 className="font-display text-xl font-semibold">Descrição</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{data.product.description}</p></div>}
        </section></div>
      )}
    </main></div>
  );
}
