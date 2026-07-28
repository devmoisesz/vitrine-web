import { apiClient } from "@/lib/api-client";
import type { Cart, CartItem } from "@/types/catalog";

export function listCarts(accessToken: string) {
  return apiClient<Cart[]>("/carts", {
    method: "GET",
    accessToken,
    authenticated: true,
  });
}

export function updateCartItem(
  cartItemId: string,
  input: { quantity: number; size?: string | null },
  accessToken: string,
) {
  return apiClient<void>(`/cart/${cartItemId}`, {
    method: "PUT",
    accessToken,
    authenticated: true,
    body: { quantity: input.quantity, size: input.size ?? undefined },
  });
}

export function removeCartItem(cartItemId: string, accessToken: string) {
  return apiClient<void>(`/cart/${cartItemId}`, {
    method: "DELETE",
    accessToken,
    authenticated: true,
  });
}

export function registerOrder(cartId: string, accessToken: string) {
  return apiClient<void>(`/cart/${cartId}/order`, {
    method: "POST",
    accessToken,
    authenticated: true,
  });
}

export function addProductToCart(
  productId: string,
  input: { quantity: number; size?: string | null },
  accessToken: string,
) {
  return apiClient<void>(`/products/${productId}/cart`, {
    method: "POST",
    accessToken,
    authenticated: true,
    body: { quantity: input.quantity, size: input.size ?? undefined },
  });
}
