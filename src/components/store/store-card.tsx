import Image from "next/image";
import Link from "next/link";
import type { SearchedStore } from "@/features/store/api/fetch-stores-search";

export function StoreCard({ store }: { store: SearchedStore }) {
  return <article className="vw-store-tile">
    <div className="vw-tile-banner">
      {store.bannerUrl ? <Image src={store.bannerUrl} alt="" fill unoptimized sizes="(max-width:560px) 100vw, 50vw" className="object-cover" /> : <span>{store.name}</span>}
    </div>
    <div className="vw-tile-body">
      <div className="vw-tile-identity">{store.logo_image_url && <Image src={store.logo_image_url} alt={`Logo de ${store.name}`} width={44} height={44} unoptimized className="vw-tile-logo" />}<div><span className="vw-tag">NA VITRINE WEB</span><h2>{store.name}</h2></div></div>
      <p>{store.description || "Conheça o catálogo e converse diretamente com esta loja."}</p>
      <Link className="vw-button vw-outline" href={`/loja/${store.slug}`}>Conhecer a loja <span aria-hidden="true">→</span></Link>
    </div>
  </article>;
}
