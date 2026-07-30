import { apiClient } from "@/lib/api-client";
import type { ProductDetailResponse } from "@/types/product-detail";

export function fetchProductDetail(productId: string) {
  return apiClient<ProductDetailResponse>(`/products/${productId}`, {
    method: "GET",
  });
}
