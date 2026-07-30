import { apiClient } from "@/lib/api-client";

export interface SearchedStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_image_url: string | null;
}

export interface StoresSearchParams { name?: string; page: number }

export async function fetchStoresSearch({ name, page }: StoresSearchParams) {
  const params = new URLSearchParams({ page: String(page) });
  if (name) params.set("name", name);
  const data = await apiClient<SearchedStore[]>(`/stores?${params.toString()}`, { method: "GET", credentials: "include" });
  return { data, page };
}
