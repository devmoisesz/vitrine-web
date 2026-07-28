interface ProductCardInfoProps {
  productName: string;
  storeName: string;
}

export function ProductCardInfo({
  productName,
  storeName,
}: ProductCardInfoProps) {
  return (
    <div data-slot="product-card-info" className="flex flex-col gap-0.5">
      <span className="line-clamp-1 text-sm text-foreground">
        {productName}
      </span>
      <span className="text-xs text-muted-foreground">{storeName}</span>
    </div>
  );
}
