import { useQuery } from "@tanstack/react-query";
import { fetchOrder } from "@/features/orders/api/fetch-order";

export function useStoreOrderDetail(
  orderId: string,
  accessToken: string | null,
) {
  return useQuery({
    queryKey: ["painel", "store-order", orderId, accessToken],
    queryFn: () => fetchOrder(orderId, accessToken!),
    enabled: Boolean(orderId && accessToken),
  });
}
