import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { StoreBanner } from "@/components/store/store-banner";
import type { HomeStore } from "@/types/home";

export function StoreBlock({ store }: { store: HomeStore }) {
  const profileHref = `/loja/${store.slug}`;
  return (
    <article data-slot="store-block">
      <StoreBanner
        bannerUrl={store.bannerUrl}
        logoUrl={store.logo_image_url}
        storeName={store.name}
        href={profileHref}
      />
      <Link
        href={profileHref}
        className="mt-3 inline-block font-display text-2xl font-semibold hover:underline"
      >
        {store.name}
      </Link>
      {store.description ? (
        <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {store.description}
        </p>
      ) : null}
      {store.products.length > 0 && (
        <div className="mt-6 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] md:mx-0 md:px-0">
          {store.products.map((product) => (
            <div key={product.id} className="w-40 shrink-0 sm:w-48">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
      <Link
        href={`/loja/${store.slug}/produtos`}
        className="mt-6 block w-fit border border-foreground px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
      >
        Ver todos os produtos
      </Link>
    </article>
  );
}
