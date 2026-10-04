import Link from "next/link";
import "@/styles/public.css";

// The commercial tokens must never wrap the catalogue or account flows.
export function CommercialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="vw-theme vw-public">
      <a href="#conteudo" className="vw-skip-link">Pular para o conteúdo</a>
      {children}
      <footer className="vw-footer">
        <Link className="vw-footer-brand" href="/">Vitrine Web</Link>
        <span>Uma plataforma para dar presença digital à sua loja.</span>
        <nav aria-label="Menu do rodapé"><Link className="vw-nav" href="/contato">Contato</Link></nav>
      </footer>
    </div>
  );
}
