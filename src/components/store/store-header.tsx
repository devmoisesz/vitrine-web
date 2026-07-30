import Image from "next/image";
import Link from "next/link";
import { StoreAddress } from "@/components/store/store-address";
import type { StoreProfile } from "@/types/store";

export function getStoreInitials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase(); }

export function StoreHeader({ store, slug }: { store: StoreProfile; slug: string }) {
  return <section className="mx-auto max-w-2xl text-center"><div className="relative mx-auto flex size-28 items-center justify-center overflow-hidden rounded-full bg-muted font-display text-2xl font-semibold">{store.logo_url ? <Image src={store.logo_url} alt={`Logo da ${store.name}`} fill unoptimized sizes="112px" className="object-cover" /> : getStoreInitials(store.name)}</div><h1 className="mt-5 font-display text-3xl font-semibold md:text-4xl">{store.name}</h1>{store.description && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">{store.description}</p>}<div className="text-left"><StoreAddress address={store.address} /></div><Link href={`/loja/${slug}/produtos`} className="mt-8 inline-block bg-foreground px-6 py-3 text-sm font-medium text-background">Ver produtos</Link></section>;
}
