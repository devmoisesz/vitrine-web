import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";
import type { SearchedStore } from "@/features/store/api/fetch-stores-search";

export function StoreCard({ store }: { store: SearchedStore }) {
  const href = `/loja/${encodeURIComponent(store.slug)}/produtos`;
  return <article className="flex min-w-0 flex-col gap-4" data-slot="store-card">
    <Link href={href} aria-label={`Explorar loja ${store.name}`} className="relative flex aspect-square items-center justify-center bg-muted p-8 focus-visible:outline-2 focus-visible:outline-offset-4">
      {store.logo_image_url ? <Image src={store.logo_image_url} alt={`Logo da ${store.name}`} fill unoptimized sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw" className="object-contain p-8" />
        : <Store className="size-14 text-muted-foreground/50" aria-hidden="true" />}
    </Link>
    <div className="flex flex-1 flex-col items-start gap-3">
      <h2 className="w-full break-words font-display text-2xl font-semibold leading-tight"><Link href={href} className="hover:underline">{store.name}</Link></h2>
      {Boolean(store.segments?.length) && <ul aria-label="Segmentos da loja" className="flex flex-wrap gap-2">{store.segments!.map(segment => <li key={segment.id} className="max-w-full break-words rounded border border-border px-2.5 py-1 text-xs text-muted-foreground">{segment.name}</li>)}</ul>}
      {store.description && <p className="w-full whitespace-pre-line break-words text-sm leading-6 text-muted-foreground">{store.description}</p>}
      <Link href={href} className="mt-auto inline-flex min-h-11 items-center border border-foreground px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-4">Explorar loja<span className="sr-only"> {store.name}</span></Link>
    </div>
  </article>;
}
