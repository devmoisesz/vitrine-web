import Link from "next/link";
import { CommercialHeader } from "@/components/layout/commercial-header";
import { CommercialLayout } from "@/components/layout/commercial-layout";
import { LandingContactCta } from "@/components/landing/landing-contact-cta";

export default function SobrePage() {
  return <CommercialLayout>
    <CommercialHeader />
    <main id="conteudo">
      <section className="vw-page-intro">
        <span className="vw-eyebrow">PARA QUEM TEM UMA LOJA</span>
        <h1>Seu negócio merece<br />um espaço próprio.</h1>
        <p className="vw-lead">Apresente sua marca, facilite a escolha dos produtos e mantenha o atendimento nas mãos da sua loja de moda.</p>
        <Link href="/contato" className="vw-button">Conversar sobre minha vitrine <span aria-hidden="true">→</span></Link>
      </section>
      <section className="vw-steps">
        <h2>Como funciona para o lojista</h2>
        <div className="vw-three">
          <article><span className="vw-number">01</span><h3>Apresente sua loja</h3><p>Converse com a equipe para cadastrar sua vitrine. Apresente sua marca com logo, banner, descrição e informações de contato.</p></article>
          <article><span className="vw-number">02</span><h3>Organize seus produtos</h3><p>No painel da loja, cadastre fotos, preços, tamanhos e estoque. O cliente explora o catálogo dentro da sua vitrine.</p></article>
          <article><span className="vw-number">03</span><h3>Continue a conversa</h3><p>O cliente monta um carrinho da sua loja e registra o pedido. A mensagem é preparada para envio ao seu WhatsApp.</p></article>
        </div>
      </section>
      <section className="vw-business-note"><h2>Quem vende é a sua loja.</h2><p>A Vitrine Web oferece o espaço digital e organiza a seleção dos produtos. O atendimento, a negociação, o pagamento e a entrega são combinados diretamente entre o lojista e o cliente.</p></section>
      <LandingContactCta />
    </main>
  </CommercialLayout>;
}
