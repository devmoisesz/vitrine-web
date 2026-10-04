import Link from "next/link";
import { AccountActions, MerchantLink } from "./account-actions";
import "@/styles/public.css";

export function CommercialHeader() {
  return <header className="vw-theme vw-platform-header">
    <Link href="/" className="vw-logo">Vitrine Web<span>PLATAFORMA PARA LOJISTAS</span></Link>
    <nav aria-label="Menu da plataforma">
      <Link className="vw-nav" href="/sobre">Para lojistas</Link>
      <Link className="vw-nav" href="/catalogo">Acessar catálogo</Link>
      <Link className="vw-nav" href="/lojas">Explorar lojas</Link>
      <Link className="vw-nav" href="/contato">Contato</Link>
    </nav>
    <div className="vw-header-actions"><AccountActions /><MerchantLink className="vw-button vw-inverse">Quero minha vitrine</MerchantLink></div>
  </header>;
}
