import { apiClient } from "@/lib/api-client";
import type { Product, ProductsPage, ProductsQueryParams } from "@/types/catalog";

export async function fetchStoreProducts(slug: string, params: ProductsQueryParams): Promise<ProductsPage> {
  const searchParams = new URLSearchParams();
  if (params.name) searchParams.set("name", params.name);
  if (params.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params.subcategoryId) searchParams.set("subcategoryId", params.subcategoryId);
  searchParams.set("page", String(params.page));
  const data = await apiClient<Product[]>(`/store/${slug}/products?${searchParams.toString()}`, { method: "GET", credentials: "include" });
  return { data, page: params.page };
}
