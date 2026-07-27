import Image from 'next/image';

interface ProductCardImageProps {
  imageUrl: string | null;
  productName: string;
  isOutOfStock: boolean;
}

export function ProductCardImage({ imageUrl, productName, isOutOfStock }: ProductCardImageProps) {
  return (
    <div data-slot="product-card-image" className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50">
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
        <div className="flex h-full items-center justify-center text-xs text-gray-500">Sem imagem</div>
      )}

      {isOutOfStock && (
        <span
          data-slot="out-of-stock-badge"
          className="absolute left-2 top-2 bg-white px-2 py-1 text-[11px] font-medium"
        >
          Indisponível
        </span>
      )}
    </div>
  );
}
