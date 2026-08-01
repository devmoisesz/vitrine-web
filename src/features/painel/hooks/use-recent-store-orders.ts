import { useQuery } from "@tanstack/react-query";
import { getRecentStoreOrders } from "../api/store";

export function useRecentStoreOrders(
  slug: string | undefined,
  accessToken: string | null,
) {
  return useQuery({
    queryKey: ["painel", "recent-orders", slug, accessToken],
    queryFn: () => getRecentStoreOrders(slug!, accessToken!),
    enabled: Boolean(slug && accessToken),
  });
}
