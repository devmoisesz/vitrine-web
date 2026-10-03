import Image from "next/image";
import Link from "next/link";
import { AccountActions } from "@/components/layout/account-actions";

export function StoreNavigation({ name, slug, logoUrl }: { name: string; slug: string; logoUrl?: string | null }) {
  return <>
    <div className="vw-shop-context"><Link href="/lojas" className="vw-text-button">← Todas as lojas</Link><span>Vitrine oferecida pela <Link href="/">Vitrine Web</Link></span><AccountActions /></div>
    <header className="vw-shop-header">
      <Link href={`/loja/${slug}`} className="vw-shop-wordmark">{logoUrl && <Image src={logoUrl} alt="" width={42} height={42} unoptimized />}{name}</Link>
      <nav aria-label={`Menu da loja ${name}`}><Link className="vw-text-button" href={`/loja/${slug}/produtos`}>Catálogo</Link><Link className="vw-text-button" href={`/loja/${slug}#sobre`}>Sobre a loja</Link><Link className="vw-button vw-outline" href={`/loja/${slug}#atendimento`}>Atendimento <span aria-hidden="true">↗</span></Link></nav>
    </header>
  </>;
}
