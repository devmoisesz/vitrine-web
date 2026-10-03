import { publicCatalog } from "@/lib/public-catalog";
import type { Product, ProductsPage, ProductsQueryParams } from "@/types/catalog";

export async function fetchStoreProducts(slug: string, params: ProductsQueryParams): Promise<ProductsPage> {
  const searchParams = new URLSearchParams();
  if (params.name) searchParams.set("name", params.name);
  if (params.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params.subcategoryId) searchParams.set("subcategoryId", params.subcategoryId);
  searchParams.set("page", String(params.page));
  const result = await publicCatalog<Product[]>(`/store/${encodeURIComponent(slug)}/products?${searchParams.toString()}`);
  return { ...result, page: params.page };
}
