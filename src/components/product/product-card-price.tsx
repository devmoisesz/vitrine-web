import { formatPrice } from "@/lib/format-price";

interface ProductCardPriceProps {
  price: string;
}

export function ProductCardPrice({ price }: ProductCardPriceProps) {
  return (
    <span
      data-slot="product-card-price"
      className="text-sm text-muted-foreground"
    >
      {formatPrice(price)}
    </span>
  );
}
