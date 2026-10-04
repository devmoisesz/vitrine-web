import Link from "next/link";
import { redirect } from "next/navigation";
import { CommercialHeader } from "@/components/layout/commercial-header";
import { CommercialLayout } from "@/components/layout/commercial-layout";
import { MerchantLink } from "@/components/layout/account-actions";
import { StorePreview } from "@/components/landing/store-preview";
import { HomeEntry } from "@/components/landing/home-entry";
import { ParticipatingStores } from "@/components/landing/participating-stores";

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  if (params.name || params.categoryId || params.subcategoryId || params.page) redirect("/catalogo?origem=busca-global");
  return <HomeEntry><CommercialLayout>
    <CommercialHeader />
    <main id="conteudo">
      <section className="vw-hero" aria-labelledby="home-title">
        <div><span className="vw-eyebrow">SUA PRESENÇA DIGITAL COMEÇA AQUI</span><h1 id="home-title">Sua loja.<br />Sua marca.<br />Sua vitrine digital.</h1><p className="vw-lead">A plataforma para lojistas de moda apresentarem sua marca, organizarem seus produtos e se aproximarem dos clientes.</p><div className="vw-actions"><MerchantLink>Quero minha vitrine</MerchantLink><Link href="/lojas" className="vw-text-button">Conhecer as lojas <span aria-hidden="true">↗</span></Link></div></div>
        <StorePreview />
      </section>
      <section className="vw-benefits" aria-label="Benefícios para sua loja">
        <div><span className="vw-number">01</span><h2>Sua marca em destaque</h2><p>Um espaço que apresenta o seu negócio.</p></div>
        <div><span className="vw-number">02</span><h2>Seu catálogo organizado</h2><p>Os clientes exploram os produtos da sua loja.</p></div>
        <div><span className="vw-number">03</span><h2>Atendimento próximo</h2><p>A conversa e a negociação continuam com você.</p></div>
      </section>
      <section className="vw-bottom-cta"><div><span className="vw-eyebrow">CONHEÇA QUEM FAZ PARTE</span><h2>Descubra as lojas da Vitrine Web.</h2></div><Link href="/lojas" className="vw-button vw-outline">Explorar lojas <span aria-hidden="true">→</span></Link></section>
      <ParticipatingStores />
      <section className="vw-home-details" aria-label="Sobre a plataforma">
        <div><span className="vw-eyebrow">DA VITRINE À CONVERSA</span><h2>Quem vende é a loja.</h2><p>O cliente escolhe os produtos, monta um carrinho da loja e envia o pedido pelo WhatsApp. Atendimento, pagamento e entrega são combinados diretamente com o lojista.</p><Link href="/sobre" className="vw-text-button">Entenda como funciona <span aria-hidden="true">→</span></Link></div>
        <div className="vw-faq"><h2>Dúvidas frequentes</h2><details><summary>Como ter uma vitrine?</summary><p>Converse com a equipe pelo <Link href="/sobre#contato">contato comercial</Link>. O cadastro da loja é feito pela administração da plataforma.</p></details><details><summary>O cliente precisa criar uma conta?</summary><p>As lojas e seus produtos são públicos. Para montar o carrinho e registrar um pedido, o cliente entra em sua conta.</p></details><details><summary>Como o pedido é concluído?</summary><p>A seleção é registrada e preparada para envio ao WhatsApp. A loja combina os detalhes e conclui a venda com o cliente.</p></details></div>
      </section>
    </main>
  </CommercialLayout></HomeEntry>;
}
