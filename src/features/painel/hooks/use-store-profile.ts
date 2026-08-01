import { useQuery } from "@tanstack/react-query";
import { getStoreProfile } from "../api/store";

export function useStoreProfile(accessToken: string | null) {
  return useQuery({
    queryKey: ["painel", "profile", accessToken],
    queryFn: () => getStoreProfile(accessToken!),
    enabled: Boolean(accessToken),
  });
}
