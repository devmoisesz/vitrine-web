import { apiClient } from "@/lib/api-client";
import type { StoreProfile } from "@/types/store";

export function fetchStoreProfile(slug: string) {
  return apiClient<StoreProfile>(`/store/${slug}`, { method: "GET", credentials: "include" });
}
