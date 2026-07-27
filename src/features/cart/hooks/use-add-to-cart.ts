import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface AddToCartInput {
  productId: string;
  accessToken: string;
  quantity?: number;
  selectedSize?: string;
}

async function addToCart({ productId, accessToken, quantity = 1, selectedSize }: AddToCartInput) {
  await apiClient(`/products/${productId}/cart`, {
    method: 'POST',
    accessToken,
    body: { quantity, selectedSize },
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
