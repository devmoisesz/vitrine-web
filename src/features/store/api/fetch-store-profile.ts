import { publicCatalog } from "@/lib/public-catalog";
import type { StoreProfile } from "@/types/store";

export async function fetchStoreProfile(slug: string) {
  return (await publicCatalog<StoreProfile>(`/store/${encodeURIComponent(slug)}`)).data;
}
