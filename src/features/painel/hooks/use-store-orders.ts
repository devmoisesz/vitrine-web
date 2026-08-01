import { useQuery } from "@tanstack/react-query";
import { getStoreOrders } from "../api/store";

export function useStoreOrders(
  slug: string | undefined,
  page: number,
  accessToken: string | null,
) {
  return useQuery({
    queryKey: ["painel", "store-orders", slug, page, accessToken],
    queryFn: () => getStoreOrders(slug!, page, accessToken!),
    enabled: Boolean(slug && accessToken),
    placeholderData: (previousData) => previousData,
  });
}
