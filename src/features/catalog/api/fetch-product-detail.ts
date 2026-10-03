import { publicCatalog } from "@/lib/public-catalog";
import type { ProductDetailResponse } from "@/types/product-detail";

export async function fetchProductDetail(productId: string) {
  return (await publicCatalog<ProductDetailResponse>(`/products/${encodeURIComponent(productId)}`)).data;
}
