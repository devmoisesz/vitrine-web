"use client";

import Image from "next/image";
import Link from "next/link";
import { useStoresSearch } from "@/features/store/hooks/use-stores-search";
import { getStoreInitials } from "@/components/store/store-utils";

export function StorePreview() {
  const stores = useStoresSearch({ page: 1 });
  const store = stores.data?.data[0];
  return <div className="vw-demo">
    <span className="vw-eyebrow">UM ESPAÇO PARA A SUA MARCA</span>
    {store ? <>
      <div className="vw-demo-store">
        <div className="vw-demo-banner"><span>{store.name}</span><small>UMA LOJA NA VITRINE WEB</small></div>
        <div className="vw-demo-copy"><span className="vw-round-logo">{store.logo_image_url ? <Image src={store.logo_image_url} alt="" fill sizes="38px" unoptimized /> : getStoreInitials(store.name)}</span><div><strong>Uma loja com identidade própria.</strong><p>Apresentação, catálogo e atendimento em um só lugar.</p></div></div>
        <Link href={`/loja/${store.slug}`} className="vw-button vw-outline">Conhecer esta vitrine <span aria-hidden="true">→</span></Link>
      </div>
      <span className="vw-caption">Exemplo de vitrine na plataforma: {store.name}.</span>
    </> : <>
      <div className="vw-demo-store" aria-busy={stores.isLoading}>
        <div className="vw-demo-banner"><span>Vitrine Web</span><small>SUA MARCA, SEU ESPAÇO</small></div>
        <div className="vw-demo-copy"><div><strong>Apresentação, catálogo e atendimento.</strong><p role="status">{stores.isLoading ? "Carregando uma vitrine da plataforma…" : stores.isError ? "Não foi possível carregar as lojas agora." : "As novas vitrines aparecerão aqui."}</p></div></div>
        {stores.isError ? <button className="vw-button vw-outline" onClick={() => void stores.refetch()}>Tentar novamente</button> : <Link className="vw-button vw-outline" href="/lojas">Explorar lojas <span aria-hidden="true">→</span></Link>}
      </div>
      <span className="vw-caption">Um espaço próprio para apresentar sua loja na internet.</span>
    </>}
  </div>;
}
