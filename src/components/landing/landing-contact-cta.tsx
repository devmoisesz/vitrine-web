export function LandingContactCta() {
  return (
    <section id="contato" className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <p className="eyebrow text-background/65">Vamos conversar</p>
        <h2 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.98] sm:text-6xl md:text-7xl">
          Se interressou pela solução da Vitrine Web Para sua loja?
        </h2>
        <a
          href="https://wa.me/16996064411"
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-flex border border-background bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-transparent hover:text-background"
        >
          Entrar em Contato
        </a>
      </div>
    </section>
  );
}
