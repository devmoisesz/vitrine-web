import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { StoreProfile } from "@/types/store";

export function StoreProductsBar({ store, slug }: { store: StoreProfile; slug: string }) {
  const initials = store.name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  return <div className="mb-8 flex items-center gap-3 border-b border-border pb-5"><Link href={`/loja/${slug}`} aria-label="Voltar para a loja" className="p-2 text-muted-foreground"><ArrowLeft className="size-4" /></Link><div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold">{store.logo_url ? <Image src={store.logo_url} alt="" fill unoptimized sizes="40px" className="object-cover" /> : initials}</div><div><p className="text-xs text-muted-foreground">Produtos da loja</p><h1 className="font-display text-xl font-semibold">{store.name}</h1></div></div>;
}
