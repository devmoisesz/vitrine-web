import { useQuery } from "@tanstack/react-query";

import { fetchOrder } from "@/features/orders/api/fetch-order";

export function useOrder(orderId: string, accessToken: string | null) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrder(orderId, accessToken!),
    enabled: Boolean(orderId && accessToken),
  });
}
