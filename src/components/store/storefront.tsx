"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { StoreAddress } from "./store-address";
import { StoreNavigation } from "./store-navigation";
import { StoreCatalog } from "./store-catalog";
import { useStoreProfile } from "@/features/store/hooks/use-store-profile";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export function Storefront({ slug, catalogOnly = false }: { slug: string; catalogOnly?: boolean }) {
  const profile = useStoreProfile(slug);
  const store = profile.data;
  if (profile.isLoading) return <main id="conteudo" className="vw-local-section" aria-busy="true"><Link href="/lojas" className="vw-text-button">← Todas as lojas</Link><p role="status">Carregando loja…</p><div className="h-72 animate-pulse bg-muted" /></main>;
  if (profile.isError || !store) return <main id="conteudo" className="vw-local-section vw-empty"><h1>{(profile.error as { status?: number })?.status === 404 ? "Loja não encontrada" : "Não foi possível carregar esta loja"}</h1><p>Confira o endereço ou tente novamente em instantes.</p><button className="vw-button" onClick={() => void profile.refetch()}>Tentar novamente</button><div><Link className="vw-text-button" href="/lojas">Voltar para as lojas</Link></div></main>;

  const basePath = `/loja/${slug}${catalogOnly ? "/produtos" : ""}`;
  return <>
    <StoreNavigation name={store.name} slug={slug} logoUrl={store.logo_url} />
    <main id="conteudo">
      {!catalogOnly ? <>
        <section className="vw-shop-hero">
          <div><span className="vw-eyebrow">CONHEÇA A NOSSA LOJA</span><h1>{store.name}</h1><p>{store.description || "Conheça nosso catálogo e converse com a nossa equipe para encontrar as peças que combinam com você."}</p><Link href="#catalogo" className="vw-button vw-inverse">Explorar o catálogo <span aria-hidden="true">↓</span></Link></div>
          <div className="vw-shop-poster">{store.banner_url || store.logo_url ? <Image src={(store.banner_url || store.logo_url)!} alt={`Apresentação de ${store.name}`} fill unoptimized sizes="(max-width:560px) 100vw, 42vw" className={store.banner_url ? "object-cover" : "object-contain p-6"} /> : <span className="vw-poster-name">{store.name}</span>}</div>
        </section>
        <div className="vw-shop-info"><span>Catálogo de {store.name}</span>{store.address && <span>{store.address.city} / {store.address.state}</span>}<span>Atendimento direto com a loja</span></div>
      </> : <div className="vw-catalog-intro"><span className="vw-eyebrow">CATÁLOGO DA LOJA</span><h1>{store.name}</h1><Link href={`/loja/${slug}`} className="vw-text-button">Conheça a loja <span aria-hidden="true">→</span></Link></div>}
      <Suspense fallback={<div className="vw-local-section" role="status">Carregando catálogo…</div>}><StoreCatalog key={slug} slug={slug} basePath={basePath} /></Suspense>
      {!catalogOnly && <section className="vw-store-information">
        <div id="sobre"><span className="vw-eyebrow">SOBRE A LOJA</span><h2>Conheça {store.name}.</h2><p>{store.description || "Explore os produtos da nossa vitrine. Para saber mais sobre a loja e as peças, fale com a nossa equipe."}</p><StoreAddress address={store.address} /></div>
        <div id="atendimento"><span className="vw-eyebrow">FALE COM A LOJA</span><h2>Converse com quem conhece as peças.</h2><p>Tire suas dúvidas e combine pagamento e entrega diretamente com {store.name}. Você também pode montar um carrinho desta loja e preparar seu pedido para envio.</p>{store.whatsapp ? <a className="vw-button vw-outline" href={buildWhatsappUrl(store.whatsapp, `Olá, ${store.name}! Conheci a loja pela Vitrine Web e gostaria de saber mais.`)} target="_blank" rel="noopener noreferrer">Atendimento pelo WhatsApp <span aria-hidden="true">↗</span></a> : <p>O contato pelo WhatsApp ainda não foi informado pela loja.</p>}</div>
      </section>}
    </main>
  </>;
}
