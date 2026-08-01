import Image from "next/image";
import { formatBRL } from "@/lib/format";
import type { OrderItem } from "@/types/orders";

export function OrderItemRow({ item }: { item: OrderItem }) {
  const image = item.product.products_images?.[0]?.image_url;

  return (
    <li className="flex gap-4 border-t border-border py-4 first:border-t-0">
      <div className="size-20 shrink-0 overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={item.product.name}
            width={80}
            height={80}
            className="size-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.product.name}</p>
        {item.selectedSize && (
          <p className="mt-1 text-xs text-muted-foreground">
            Tamanho {item.selectedSize}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Quantidade: {item.quantity} · {formatBRL(item.price)} cada
        </p>
      </div>

      <span className="shrink-0 text-sm font-medium">
        {formatBRL(Number(item.price) * item.quantity)}
      </span>
    </li>
  );
}
