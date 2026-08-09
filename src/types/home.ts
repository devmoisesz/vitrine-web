import type { Product } from "@/types/catalog";

export interface HomeStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** A API /home/stores retorna `logo_image_url` (camelCase). */
  logo_image_url: string | null;
  /** A API /home/stores retorna `bannerUrl` (camelCase). */
  bannerUrl: string | null;
  products: Product[];
}

export interface HomeStoresPage {
  data: HomeStore[];
  page: number;
  totalCount?: number;
}
