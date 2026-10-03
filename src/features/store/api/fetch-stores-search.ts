import { publicCatalog } from "@/lib/public-catalog";

export interface SearchedStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_image_url: string | null;
  bannerUrl?: string | null;
}

export interface StoresSearchParams { name?: string; page: number }

export async function fetchStoresSearch({ name, page }: StoresSearchParams) {
  const params = new URLSearchParams({ page: String(page) });
  if (name) params.set("name", name);
  const result = await publicCatalog<SearchedStore[]>(`/stores?${params.toString()}`);
  return { ...result, page };
}
