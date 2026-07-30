import { useQuery } from "@tanstack/react-query";
import { fetchStoreProducts } from "@/features/store/api/fetch-store-products";
import type { ProductsQueryParams } from "@/types/catalog";

export function useStoreProducts(slug: string, params: ProductsQueryParams) {
  return useQuery({ queryKey: ["store-products", slug, params.name, params.categoryId, params.subcategoryId, params.page], queryFn: () => fetchStoreProducts(slug, params), enabled: Boolean(slug), placeholderData: (previousData) => previousData });
}
