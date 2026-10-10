import { publicCatalog } from "@/lib/public-catalog";
import type { Segment } from "@/types/segment";

export interface SearchedStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_image_url: string | null;
  bannerUrl?: string | null;
  segments?: Segment[];
}

export interface StoresSearchParams { name?: string; page: number; segments?: string[] }

export async function fetchStoresSearch({ name, page, segments }: StoresSearchParams) {
  const params = new URLSearchParams({ page: String(page) });
  if (name) params.set("name", name);
  if (segments?.length) params.set("segments", [...new Set(segments)].sort().join(","));
  const result = await publicCatalog<SearchedStore[]>(`/stores?${params.toString()}`);
  return { ...result, page };
}
