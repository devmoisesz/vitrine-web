export function LandingHero() {
  return (
    <section className="border-b border-border bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-32">
        <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
          Sua loja merece mais que um checkout genérico.
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-7 text-background/75 md:text-lg">
          A Vitrine Web aproxima sua marca de quem quer descobrir, perguntar
          e comprar moda com confiança.
        </p>
        <a
          href="#contato"
          className="mt-10 inline-flex border border-background bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-transparent hover:text-background"
        >
          Quero conhecer a Vitrine Web
        </a>
      </div>
    </section>
  );
}
