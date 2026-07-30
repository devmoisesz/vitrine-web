"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAddToCart } from "@/features/cart/hooks/use-add-to-cart";

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
  size: string | null;
  requiresSize: boolean;
  outOfStock: boolean;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function AddToCartButton({ productId, quantity, size, requiresSize, outOfStock, onSuccess, onError }: AddToCartButtonProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();
  const addToCart = useAddToCart();
  const disabled = outOfStock || (requiresSize && !size) || addToCart.isPending;

  function handleClick() {
    if (!isAuthenticated || !accessToken) {
      router.push(`/login?redirect=/produto/${productId}`);
      return;
    }
    addToCart.mutate(
      { productId, accessToken, quantity, ...(size ? { size } : {}) },
      { onSuccess, onError: (error) => onError(error instanceof Error ? error.message : "Não foi possível adicionar o produto ao carrinho.") },
    );
  }

  return <Button className="mt-7 w-full" size="lg" disabled={disabled} onClick={handleClick}>{outOfStock ? "Indisponível" : addToCart.isPending ? "Adicionando..." : "Adicionar ao carrinho"}</Button>;
}
