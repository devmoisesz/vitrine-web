import Link from "next/link";

export function PublicFooter() {
  return <footer className="mt-auto border-t border-border bg-background px-4 py-8 md:px-8">
    <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 text-sm">
      <Link href="/" className="font-display text-xl font-semibold">Vitrine Web</Link>
      <nav aria-label="Menu do rodapé" className="flex flex-wrap gap-x-6 gap-y-3">
        <Link href="/lojas" className="hover:underline">Explorar lojas</Link>
        <Link href="/sobre" className="hover:underline">Entenda a Vitrine Web</Link>
        <Link href="/contato" className="hover:underline">Contato</Link>
      </nav>
    </div>
  </footer>;
}
