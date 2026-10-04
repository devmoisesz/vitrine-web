import type { Metadata } from "next";
import { ArrowUpRight, CircleHelp, MessageCircle, Rocket, ShoppingBag, Store } from "lucide-react";
import { CommercialHeader } from "@/components/layout/commercial-header";
import { CommercialLayout } from "@/components/layout/commercial-layout";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import "@/styles/contact.css";

export const metadata: Metadata = {
  title: "Contato | Vitrine Web",
  description: "Converse com a equipe da Vitrine Web pelo WhatsApp e descubra como dar à sua loja um espaço próprio no digital.",
};

// Commercial contact already used by LandingContactCta before the redesign.
// This number is independent of store profiles and their customer service links.
const commercialWhatsapp = buildWhatsappUrl(
  "5516996064411",
  "Olá! Gostaria de conhecer melhor a Vitrine Web e entender como funciona para minha loja.",
);

const reasons = [
  { Icon: Store, title: "Saiba mais sobre a Vitrine Web", description: "Entenda como a plataforma conecta sua marca aos clientes, preservando a identidade da sua loja." },
  { Icon: ShoppingBag, title: "Descubra como podemos ajudar sua loja a vender", description: "Apresente seus produtos em um catálogo organizado e facilite o contato dos clientes pelo WhatsApp." },
  { Icon: CircleHelp, title: "Tire suas dúvidas sobre a mensalidade", description: "Conheça os valores, o que está incluído e como funciona a contratação." },
  { Icon: Rocket, title: "Saiba como começar", description: "Converse com nossa equipe sobre os primeiros passos para colocar sua vitrine no ar." },
];

export default function ContatoPage() {
  return (
    <CommercialLayout>
      <CommercialHeader />
      <main id="conteudo" className="vw-contact-page">
        <div className="vw-contact-copy">
          <h1>Fale com nossa equipe</h1>
          <p className="vw-lead">Conheça a Vitrine Web e descubra como dar à sua loja um espaço próprio no digital.</p>
          <div className="vw-contact-reasons">
            {reasons.map(({ Icon, title, description }) => (
              <section className="vw-contact-reason" key={title}>
                <span className="vw-contact-icon"><Icon size={20} strokeWidth={1.5} aria-hidden="true" /></span>
                <div><h2>{title}</h2><p>{description}</p></div>
              </section>
            ))}
          </div>
        </div>
        <section className="vw-contact-panel" aria-labelledby="conversation-title">
          <MessageCircle className="vw-conversation-icon" size={32} strokeWidth={1.5} aria-hidden="true" />
          <h2 id="conversation-title">Vamos conversar sobre sua loja</h2>
          <p>Fale com nossa equipe pelo WhatsApp para conhecer a plataforma e tirar suas dúvidas.</p>
          <a className="vw-button vw-contact-whatsapp" href={commercialWhatsapp} target="_blank" rel="noopener noreferrer" aria-describedby="whatsapp-note">
            <span>Falar com nossa equipe no WhatsApp</span><ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <p id="whatsapp-note" className="vw-contact-support">Você será direcionado para uma conversa com a Vitrine Web.</p>
        </section>
      </main>
    </CommercialLayout>
  );
}
