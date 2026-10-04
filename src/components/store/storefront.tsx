"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { StoreAddress } from "./store-address";
import { StoreProductsBar } from "./store-products-bar";
import { StoreCatalog } from "./store-catalog";
import { useStoreProfile } from "@/features/store/hooks/use-store-profile";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { translateDeliveryMethod, translatePaymentMethod } from "@/features/checkout/lib/build-whatsapp-message";

export function Storefront({ slug, catalogOnly = false }: { slug: string; catalogOnly?: boolean }) {
  const profile = useStoreProfile(slug);
  const store = profile.data;
  const basePath = `/loja/${slug}${catalogOnly ? "/produtos" : ""}`;
  return <div className="min-h-screen bg-background">
    <Header storeSlug={slug} />
    <main id="conteudo" className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
      {profile.isLoading ? <div role="status" aria-label="Carregando loja"><div className="aspect-[4/1] animate-pulse bg-muted" /><div className="mt-8 h-64 animate-pulse bg-muted" /></div>
        : profile.isError || !store ? <div className="border border-dashed border-border p-10 text-center"><h1 className="font-display text-2xl font-semibold">{(profile.error as { status?: number })?.status === 404 ? "Loja não encontrada" : "Não foi possível carregar esta loja"}</h1><p className="mt-2 text-sm text-muted-foreground">Confira o endereço ou tente novamente em instantes.</p><Button className="mt-6" onClick={() => void profile.refetch()}>Tentar novamente</Button><div className="mt-4"><Link href="/catalogo" className="text-sm underline">Voltar para o catálogo de lojas</Link></div></div>
        : <>
          <StoreProductsBar store={store} slug={slug} />
          <Suspense fallback={<p role="status">Carregando catálogo…</p>}><StoreCatalog key={slug} slug={slug} basePath={basePath} /></Suspense>
          <section id="atendimento" className="mt-14 scroll-mt-36 border-t border-border pt-8">
            <h2 className="font-display text-xl font-semibold">Sobre {store.name}</h2>
            {store.description && <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-muted-foreground">{store.description}</p>}
            <StoreAddress address={store.address} />
            {Boolean(store.delivery_methods?.length) && <p className="mt-3 text-sm text-muted-foreground"><strong>Entrega e retirada:</strong> {store.delivery_methods!.map(translateDeliveryMethod).join(", ")}.</p>}
            {Boolean(store.payment_methods?.length) && <p className="mt-3 text-sm text-muted-foreground"><strong>Pagamento combinado com a loja:</strong> {store.payment_methods!.map(translatePaymentMethod).join(", ")}.</p>}
            {store.whatsapp && <a href={buildWhatsappUrl(store.whatsapp, `Olá, ${store.name}! Conheci a loja pela Vitrine Web e gostaria de saber mais.`)} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block border border-foreground px-5 py-3 text-sm">Atendimento pelo WhatsApp ↗</a>}
          </section>
        </>}
    </main>
  </div>;
}
