export function LandingProblemSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-12 md:gap-16 md:py-28">
        <p className="eyebrow md:col-span-3">O problema</p>
        <div className="md:col-span-8">
          <h2 className="max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
            Moda não se resolve só com um botão de finalizar compra.
          </h2>
          <p className="mt-7 max-w-2xl leading-7 text-muted-foreground">
            Taxas altas, carrinhos complexos e um atendimento distante deixam
            a venda mais difícil. E, para quem compra, dúvidas sobre caimento,
            tecido e tamanho não cabem em um checkout automatizado.
          </p>
        </div>
      </div>
    </section>
  );
}
