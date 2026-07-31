import { useMutation } from "@tanstack/react-query";

import { registerOrder } from "@/features/cart/api/cart";

export function useCreateOrder(accessToken: string | null) {
  return useMutation({
    mutationFn: (cartId: string) => registerOrder(cartId, accessToken!),
  });
}
