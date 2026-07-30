import { useQuery } from "@tanstack/react-query";
import { fetchStoreProfile } from "@/features/store/api/fetch-store-profile";

export function useStoreProfile(slug: string) {
  return useQuery({ queryKey: ["store-profile", slug], queryFn: () => fetchStoreProfile(slug), enabled: Boolean(slug) });
}
