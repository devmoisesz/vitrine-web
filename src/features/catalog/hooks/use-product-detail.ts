import { useQuery } from "@tanstack/react-query";

import { fetchProductDetail } from "@/features/catalog/api/fetch-product-detail";

export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: ["product-detail", productId],
    queryFn: () => fetchProductDetail(productId),
    enabled: Boolean(productId),
  });
}
