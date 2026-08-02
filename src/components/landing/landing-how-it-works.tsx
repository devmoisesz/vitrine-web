const steps = [
  ["01", "Sua loja entra no catálogo", "Uma vitrine profissional dentro de um catálogo unificado e fácil de descobrir."],
  ["02", "O cliente encontra e escolhe", "Ele navega pelas peças, conhece sua marca e encontra o que procura."],
  ["03", "A conversa continua no WhatsApp", "A negociação e a venda seguem do jeito mais humano — e mais próximo — que já funciona para sua loja."],
];

export function LandingHowItWorks() {
  return (
    <section className="border-b border-border bg-muted">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <p className="eyebrow">Como funciona</p>
        <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
          Uma vitrine para descobrir. Uma conversa para vender.
        </h2>
        <ol className="mt-14 grid border-t border-foreground sm:grid-cols-3">
          {steps.map(([number, title, description]) => (
            <li key={number} className="border-b border-foreground py-7 sm:border-b-0 sm:border-r sm:px-7 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
              <span className="text-sm tabular-nums">{number}</span>
              <h3 className="mt-10 font-serif text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
