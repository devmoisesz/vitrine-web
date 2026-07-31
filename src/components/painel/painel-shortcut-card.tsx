import Link from "next/link";
import type { ReactNode } from "react";

export function PainelShortcutCard({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="block rounded-xl border border-gray-200 bg-white p-5 text-sm font-medium transition-colors hover:border-black hover:bg-gray-50">{children}</Link>;
}
