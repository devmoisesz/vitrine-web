import { useQuery } from "@tanstack/react-query";
import { getStoreProducts } from "../api/store";

export function useStoreMetrics(
  slug: string | undefined,
  accessToken: string | null,
) {
  return useQuery({
    queryKey: ["painel", "metrics", slug, accessToken],
    queryFn: () => getStoreProducts(slug!, accessToken!),
    enabled: Boolean(slug && accessToken),
  });
}
