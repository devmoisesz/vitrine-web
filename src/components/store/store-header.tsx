import Link from "next/link";
import { StoreAddress } from "@/components/store/store-address";
import { StoreBanner } from "@/components/store/store-banner";
import type { StoreProfile } from "@/types/store";

export function StoreHeader({
  store,
  slug,
}: {
  store: StoreProfile;
  slug: string;
}) {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <StoreBanner
        bannerUrl={store.banner_url}
        logoUrl={store.logo_url}
        storeName={store.name}
      />

      <div className="px-2 pb-2 text-center md:px-0">
        <h1 className="mt-5 font-display text-3xl font-semibold md:text-4xl">
          {store.name}
        </h1>

        <Link
          href={`/loja/${slug}/produtos`}
          className="mt-6 inline-block bg-foreground px-6 py-3 text-sm font-medium text-background"
        >
          Ver produtos
        </Link>

        {store.description ? (
          <p className="mt-6 whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {store.description}
          </p>
        ) : null}

        <div className="mt-6 text-left">
          <StoreAddress address={store.address} />
        </div>
      </div>
    </section>
  );
}
