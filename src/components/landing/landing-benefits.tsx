const benefits = [
  "Sem taxa por venda",
  "Sem gestão de carrinho ou pagamento online",
  "Você continua no controle da negociação e do relacionamento",
  "Uma vitrine profissional, sem precisar construir um site próprio",
];

export function LandingBenefits() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-12 md:gap-16 md:py-28">
        <div className="md:col-span-4">
          <p className="eyebrow">O que fica com você</p>
          <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
            Menos plataforma. Mais relação.
          </h2>
        </div>
        <ul className="border-t border-foreground md:col-span-7 md:col-start-6">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex gap-5 border-b border-border py-5 text-lg leading-7">
              <span aria-hidden="true">—</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
