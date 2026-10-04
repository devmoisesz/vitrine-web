import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StoreBanner } from "@/components/store/store-banner";
import type { StoreProfile } from "@/types/store";

export function StoreProductsBar({
  store,
  slug,
}: {
  store: StoreProfile;
  slug: string;
}) {
  return (
    <div className="mb-8 border-b border-border pb-5">
      <div className="flex items-center gap-3">
        <Link
          href="/catalogo"
          aria-label="Voltar para o catálogo de lojas"
          className="p-2 text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <p className="text-xs text-muted-foreground">Produtos de {store.name}</p>
      </div>
      <div className="mt-4">
        <StoreBanner
          bannerUrl={store.banner_url}
          logoUrl={store.logo_url}
          storeName={store.name}
          compact
          href={`/loja/${slug}/produtos`}
        />
      </div>
      <h1 className="mt-3 font-display text-2xl font-semibold">{store.name}</h1>
    </div>
  );
}
