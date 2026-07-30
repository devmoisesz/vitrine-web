import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface AddToCartInput {
  productId: string;
  accessToken: string;
  quantity?: number;
  size?: string;
}

async function addToCart({ productId, accessToken, quantity = 1, size }: AddToCartInput) {
  await apiClient(`/products/${productId}/cart`, {
    method: 'POST',
    accessToken,
    authenticated: true,
    body: { quantity, ...(size ? { size } : {}) },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carts-count'] });
    },
  });
}
