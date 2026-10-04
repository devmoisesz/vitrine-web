import Link from "next/link";

export function LandingContactCta() {
  return <section id="contato" className="vw-contact">
    <span className="vw-eyebrow">CONTATO COM A PLATAFORMA</span>
    <h2>Vamos falar sobre sua loja?</h2>
    <p>Converse com a equipe da Vitrine Web para conhecer a solução e solicitar o cadastro da sua loja.</p>
    <Link href="/contato" className="vw-button vw-inverse">Fale com nossa equipe <span aria-hidden="true">→</span></Link>
  </section>;
}
