import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function AdminShortcutCard({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="group flex min-h-32 flex-col justify-between rounded-xl border border-black bg-black p-5 text-white transition-colors hover:bg-neutral-800">
      <span className="text-base font-medium">{children}</span>
      <ArrowUpRight className="size-5 self-end transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}
