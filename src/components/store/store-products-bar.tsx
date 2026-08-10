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
          href={`/loja/${slug}`}
          aria-label="Voltar para a loja"
          className="p-2 text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <p className="text-xs text-muted-foreground">Produtos da loja</p>
      </div>
      <div className="mt-4">
        <StoreBanner
          bannerUrl={store.banner_url}
          logoUrl={store.logo_url}
          storeName={store.name}
          compact
          href={`/loja/${slug}`}
        />
      </div>
    </div>
  );
}
