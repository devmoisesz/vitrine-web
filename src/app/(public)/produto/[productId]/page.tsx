"use client";

import Link from "next/link";
import { use, useState } from "react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductGallery } from "@/components/product/product-gallery";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { SizeSelector } from "@/components/product/size-selector";
import { StoreNavigation } from "@/components/store/store-navigation";
import { useProductDetail } from "@/features/catalog/hooks/use-product-detail";
import { formatBRL } from "@/lib/format";
import type { ProductDetailResponse } from "@/types/product-detail";

export default function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const product = useProductDetail(productId);
  if (product.isLoading) return <main id="conteudo" className="vw-local-section" aria-busy="true"><p role="status">Carregando produto…</p><div className="mt-6 h-96 animate-pulse bg-muted" /></main>;
  if (product.isError || !product.data) return <main id="conteudo" className="vw-local-section vw-empty"><h1>{(product.error as {status?:number})?.status === 404 ? "Produto não encontrado" : "Não foi possível carregar este produto"}</h1><p>Este produto pode não estar disponível. Confira o endereço ou tente novamente.</p><button className="vw-button" onClick={() => void product.refetch()}>Tentar novamente</button><div><Link href="/lojas" className="vw-text-button">Explorar lojas</Link></div></main>;
  return <ProductContent key={product.data.product.id} data={product.data} />;
}

function ProductContent({ data }: { data: ProductDetailResponse }) {
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const { product } = data;
  const store = product.store;
  return <>
    <StoreNavigation name={store.name} slug={store.slug} logoUrl={store.logo_url || store.logo_image_url} />
    <main id="conteudo" className="vw-product-layout">
      <ProductGallery images={data.images} productName={product.name} />
      <section>
        <Link href={`/loja/${store.slug}/produtos`} className="vw-text-button">← Catálogo de {store.name}</Link>
        <h1>{product.name}</h1>
        <p className="vw-price">{formatBRL(product.price)}</p>
        {product.stock <= 0 && <p className="vw-notice">Indisponível no momento</p>}
        <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />
        <QuantitySelector value={quantity} onChange={setQuantity} />
        <AddToCartButton productId={product.id} quantity={quantity} size={size} requiresSize={product.sizes.length > 0} outOfStock={product.stock <= 0} onSuccess={() => setNotice("Adicionado ao carrinho desta loja.")} onError={setNotice} />
        {notice && <p className="vw-notice" role="status">{notice}</p>}
        <p className="vw-order-note">O carrinho reúne sua seleção de {store.name}. Entre na sua conta para registrar o pedido e preparar o envio ao WhatsApp. A compra é combinada diretamente com a loja.</p>
        {product.description && <div className="vw-description"><h2>Sobre a peça</h2><p>{product.description}</p></div>}
        <Link href={`/loja/${store.slug}#atendimento`} className="vw-text-button">Falar com {store.name} <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  </>;
}
