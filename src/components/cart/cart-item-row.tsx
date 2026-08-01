"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { removeCartItem, updateCartItem } from "@/features/cart/api/cart";
import { formatBRL } from "@/lib/format";
import type { CartItem } from "@/types/catalog";

export function CartItemRow({ item }: { item: CartItem }) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const image = item.product.products_images?.[0]?.image_url;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["carts"] });
    queryClient.invalidateQueries({ queryKey: ["carts-count"] });
  };

  const update = useMutation({
    mutationFn: (quantity: number) =>
      updateCartItem(
        item.id,
        { quantity, size: item.selectedSize },
        accessToken!,
      ),
    onSuccess: invalidate,
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível atualizar o item.");
    },
  });

  const remove = useMutation({
    mutationFn: () => removeCartItem(item.id, accessToken!),
    onSuccess: invalidate,
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível remover o item.");
    },
  });

  const busy = update.isPending || remove.isPending;
  const lineTotal = Number(item.product.price) * item.quantity;

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

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-medium">{item.product.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.selectedSize ? `Tamanho ${item.selectedSize}` : "Tamanho único"}{" "}
          · {formatBRL(item.product.price)}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center border border-border">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              disabled={busy || item.quantity <= 1}
              onClick={() => update.mutate(item.quantity - 1)}
              className="p-1.5 disabled:opacity-30"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-8 text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              disabled={busy}
              onClick={() => update.mutate(item.quantity + 1)}
              className="p-1.5 disabled:opacity-30"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => remove.mutate()}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
          >
            <Trash2 className="size-3.5" /> Remover
          </button>
        </div>
      </div>

      <span className="shrink-0 text-sm font-medium">
        {formatBRL(lineTotal)}
      </span>
    </li>
  );
}
