import Image from "next/image";
import Link from "next/link";
import { getStoreInitials } from "@/components/store/store-utils";

interface StoreBannerProps {
  bannerUrl: string | null;
  logoUrl: string | null;
  storeName: string;
  href?: string;
  compact?: boolean;
}

export function StoreBanner({
  bannerUrl,
  logoUrl,
  storeName,
  href,
  compact = false,
}: StoreBannerProps) {
  const content = (
    <>
      <div className="relative overflow-hidden bg-black aspect-[4/1]">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={`Capa da ${storeName}`}
            fill
            unoptimized
            sizes={
              compact
                ? "(max-width: 900px) 100vw, 900px"
                : "(max-width: 1400px) 100vw, 1120px"
            }
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="relative -mt-10 ml-5 flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted font-display text-xl font-semibold shadow-sm">
        <div className="absolute inset-0 flex items-center justify-center">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`Logo da ${storeName}`}
              fill
              unoptimized
              sizes="112px"
              className="object-cover"
            />
          ) : (
            getStoreInitials(storeName)
          )}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <div className="w-full">
        <Link href={href} aria-label={`Visitar ${storeName}`} className="block">
          {content}
        </Link>
      </div>
    );
  }

  return <div className="w-full">{content}</div>;
}
