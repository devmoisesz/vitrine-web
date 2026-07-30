import Image from "next/image";
import Link from "next/link";
import { getStoreInitials } from "@/components/store/store-header";
import type { SearchedStore } from "@/features/store/api/fetch-stores-search";

export function StoreCard({ store }: { store: SearchedStore }) {
  return <Link href={`/loja/${store.slug}`} className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-shadow hover:shadow-md sm:block sm:p-4"><div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-display text-lg font-semibold sm:size-24">{store.logo_image_url ? <Image src={store.logo_image_url} alt={`Logo da ${store.name}`} fill unoptimized sizes="96px" className="object-cover" /> : getStoreInitials(store.name)}</div><div className="min-w-0 sm:mt-4"><h2 className="truncate font-display text-lg font-semibold group-hover:underline sm:text-xl">{store.name}</h2><p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{store.description || "Conheça esta loja na Vitrine Web."}</p></div></Link>;
}
