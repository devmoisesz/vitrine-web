import { formatPrice } from "@/lib/format-price";
import type { CartItem } from "@/types/catalog";

export function CheckoutItemsSummary({ items }: { items: CartItem[] }) {
  return (
    <section aria-labelledby="itens-do-pedido">
      <h2 id="itens-do-pedido" className="font-display text-xl font-semibold">
        Itens do pedido
      </h2>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-4 text-sm">
            <p>
              {item.quantity}x {item.product.name}
              {item.selectedSize ? ` (Tamanho: ${item.selectedSize})` : ""}
            </p>
            <span className="shrink-0 font-medium">{formatPrice(item.product.price)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
