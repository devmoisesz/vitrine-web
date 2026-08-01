"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

import { formatBRL, formatRelativeTime, pluralize } from "@/lib/format";
import { cartItemCount, cartSubtotal } from "@/lib/whatsapp";
import type { Cart } from "@/types/catalog";
import { CartItemRow } from "./cart-item-row";

export function StoreCartCard({ cart }: { cart: Cart }) {
  const [expanded, setExpanded] = useState(false);
  const logo = cart.store.logo_image_url ?? cart.store.logo_url;
  const itemCount = cartItemCount(cart);
  const subtotal = cartSubtotal(cart);

  return (
    <article className="border border-border">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6 md:p-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="size-11 shrink-0 overflow-hidden rounded-full bg-muted">
            {logo ? <Image src={logo} alt={cart.store.name} width={44} height={44} className="size-full object-cover" /> : <span className="flex size-full items-center justify-center text-xs font-medium">{cart.store.name.slice(0, 2).toUpperCase()}</span>}
          </div>
          <div className="min-w-0"><h2 className="truncate font-display text-base font-semibold">{cart.store.name}</h2><p className="text-xs text-muted-foreground">Atualizado {formatRelativeTime(cart.updatedAt)}</p></div>
        </div>
        <div className="flex items-center gap-6 md:justify-end"><div className="text-sm"><p className="text-muted-foreground">{pluralize(itemCount, "item", "itens")}</p><p className="font-display text-lg font-semibold">{formatBRL(subtotal)}</p></div></div>
        <div className="flex flex-col gap-2 sm:flex-row md:shrink-0">
          <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="flex items-center justify-center gap-2 border border-foreground px-4 py-2.5 text-sm transition-colors hover:bg-accent">
            {expanded ? "Ocultar produtos" : "Ver produtos"}<ChevronDown className={twMerge("size-4 transition-transform", expanded && "rotate-180")} />
          </button>
          {itemCount > 0 ? <Link href={`/carrinhos/${cart.id}/checkout`} className="flex items-center justify-center gap-2 bg-whatsapp px-4 py-2.5 text-sm font-medium text-whatsapp-foreground transition-opacity hover:opacity-90"><MessageCircle className="size-4" />Finalizar pedido</Link> : <span className="flex cursor-not-allowed items-center justify-center gap-2 bg-whatsapp px-4 py-2.5 text-sm font-medium text-whatsapp-foreground opacity-50"><MessageCircle className="size-4" />Finalizar pedido</span>}
        </div>
      </div>
      {expanded && <div className="border-t border-border px-4 pb-4 md:px-6 md:pb-6"><ul className="flex flex-col">{cart.cart_items.map((item) => <CartItemRow key={item.id} item={item} />)}</ul></div>}
    </article>
  );
}
