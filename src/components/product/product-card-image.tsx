import Image from "next/image";

interface ProductCardImageProps {
  imageUrl: string | null;
  productName: string;
  isOutOfStock: boolean;
}

export function ProductCardImage({
  imageUrl,
  productName,
  isOutOfStock,
}: ProductCardImageProps) {
  return (
    <div
      data-slot="product-card-image"
      className="relative aspect-[3/4] w-full overflow-hidden bg-muted"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={productName}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-opacity group-hover:opacity-90"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          sem imagem
        </div>
      )}

      {isOutOfStock && (
        <span className="absolute left-0 top-0 bg-foreground px-2 py-1 text-[10px] uppercase tracking-widest text-background">
          Esgotado
        </span>
      )}
    </div>
  );
}
