import Link from "next/link";

import { formatBRL } from "@/lib/format";
import type { Order } from "@/types/orders";

const orderDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatOrderDate(date: string) {
  return orderDateFormatter.format(new Date(date));
}

export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="flex flex-col gap-5 border border-border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Pedido realizado em</p>
        <h2 className="mt-1 font-display text-lg font-semibold">
          {formatOrderDate(order.createdAt)}
        </h2>
        <p className="mt-2 text-sm font-medium">{formatBRL(order.total)}</p>
      </div>

      <Link
        href={`/pedidos/${order.id}`}
        className="inline-flex w-fit items-center justify-center border border-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
      >
        Ver detalhes
      </Link>
    </article>
  );
}
