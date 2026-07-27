import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface CartItem {
  quantity: number;
}

interface Cart {
  cart_items: CartItem[];
}

async function fetchCartsCount(accessToken: string): Promise<number> {
  const carts = await apiClient<Cart[]>('/carts', { method: 'GET', accessToken });

  return carts.reduce((total, cart) => {
    const cartTotal = cart.cart_items.reduce((sum, item) => sum + item.quantity, 0);
    return total + cartTotal;
  }, 0);
}

/**
 * Só deve ser usado quando o usuário está autenticado — a Home nunca chama
 * este hook para visitantes (ver regra de negócio no header).
 */
export function useCartCount(accessToken: string | null) {
  return useQuery({
    queryKey: ['carts-count'],
    queryFn: () => fetchCartsCount(accessToken!),
    enabled: Boolean(accessToken),
    staleTime: 1000 * 30, // 30s — badge não precisa ser em tempo real
  });
}
