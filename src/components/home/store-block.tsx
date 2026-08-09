import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getStoreInitials } from "@/components/store/store-header";
import type { HomeStore } from "@/types/home";

export function StoreBlock({ store }: { store: HomeStore }) {
  const profileHref = `/loja/${store.slug}`;
  return (
    <article data-slot="store-block">
      <Link
        href={profileHref}
        aria-label={`Visitar ${store.name}`}
        className="relative block aspect-[4/1] overflow-hidden bg-black"
      >
        {store.bannerUrl && (
          <Image
            src={store.bannerUrl}
            alt={`Capa da ${store.name}`}
            fill
            unoptimized
            sizes="(max-width: 1400px) 100vw, 1120px"
            className="object-cover"
          />
        )}
      </Link>
      <div className="relative -mt-10 ml-5 flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted font-display text-xl font-semibold">
        <Link
          href={profileHref}
          aria-label={`Perfil da ${store.name}`}
          className="absolute inset-0 flex items-center justify-center"
        >
          {store.logo_image_url ? (
            <Image
              src={store.logo_image_url}
              alt={`Logo da ${store.name}`}
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
          ) : (
            getStoreInitials(store.name)
          )}
        </Link>
      </div>
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
