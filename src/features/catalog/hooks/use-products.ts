import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/fetch-products';
import type { ProductsQueryParams } from '@/types/catalog';

export function useProducts(params: ProductsQueryParams, initialData?: Awaited<ReturnType<typeof fetchProducts>>) {
  return useQuery({
    // A queryKey reflete os mesmos filtros da URL — página nova ou filtro novo
    // gera cache próprio, e voltar para um filtro já visto não refaz o fetch.
    queryKey: ['products', params.name, params.categoryId, params.subcategoryId, params.page],
    queryFn: () => fetchProducts(params),
    initialData,
    placeholderData: (previousData) => previousData,
  });
}
