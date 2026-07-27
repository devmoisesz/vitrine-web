import { formatPrice } from '@/lib/format-price';

interface ProductCardPriceProps {
  price: string;
}

export function ProductCardPrice({ price }: ProductCardPriceProps) {
  return (
    <span data-slot="product-card-price" className="font-serif text-sm">
      {formatPrice(price)}
    </span>
  );
}
