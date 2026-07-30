import { formatOrderDate } from "@/components/orders/order-card";
import { formatBRL } from "@/lib/format";

interface OrderSummaryProps {
  createdAt: string;
  total: string;
  compact?: boolean;
}

export function OrderSummary({ createdAt, total, compact = false }: OrderSummaryProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between border-t border-border pt-5">
        <span className="font-display text-lg font-semibold">Total</span>
        <span className="font-display text-lg font-semibold">{formatBRL(total)}</span>
      </div>
    );
  }

  return (
    <header className="border-b border-border pb-6">
      <p className="text-sm text-muted-foreground">Pedido realizado em</p>
      <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
        {formatOrderDate(createdAt)}
      </h1>
      <p className="mt-4 text-lg font-medium">Total: {formatBRL(total)}</p>
    </header>
  );
}
