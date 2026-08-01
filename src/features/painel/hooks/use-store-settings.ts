import { useQuery } from "@tanstack/react-query";
import { getStoreSettings } from "../api/store";

export function useStoreSettings(
  slug: string | undefined,
  accessToken: string | null,
) {
  return useQuery({
    queryKey: ["painel", "store-settings", slug, accessToken],
    queryFn: () => getStoreSettings(slug!, accessToken!),
    enabled: Boolean(slug && accessToken),
  });
}
