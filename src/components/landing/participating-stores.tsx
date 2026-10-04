"use client";

import Image from "next/image";
import Link from "next/link";
import { useStoresSearch } from "@/features/store/hooks/use-stores-search";

export function ParticipatingStores() {
  const stores = useStoresSearch({ page: 1 });
  if (!stores.data?.data.length) return null;
  return <nav aria-label="Lojas participantes" className="flex flex-wrap gap-6 px-[22px] pb-8 sm:px-[42px]">
    {stores.data.data.slice(0, 6).map(store => <Link key={store.id} href={`/loja/${store.slug}/produtos`} className="flex items-center gap-3 rounded-md border border-border px-4 py-3">
      {store.logo_image_url && <Image src={store.logo_image_url} alt="" width={40} height={40} unoptimized className="size-10 rounded-full object-cover" />}
      <span>{store.name} <span aria-hidden="true">→</span></span>
    </Link>)}
  </nav>;
}
