import { useQuery } from "@tanstack/react-query";

import { fetchOrders } from "@/features/orders/api/fetch-orders";

export function useOrders(page: number, accessToken: string | null) {
  return useQuery({
    queryKey: ["orders", page],
    queryFn: () => fetchOrders(page, accessToken!),
    enabled: Boolean(accessToken),
    placeholderData: (previousData) => previousData,
  });
}
