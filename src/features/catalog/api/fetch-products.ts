import { apiClient } from '@/lib/api-client';
import type { Product, ProductsPage, ProductsQueryParams } from '@/types/catalog';

/**
 * GET /products?name=&categoryId=&subcategoryId=&page=
 *
 * Atenção: a API hoje devolve um array puro, sem total de itens/páginas.
 * Este fetcher já lê um header `X-Total-Count` de forma defensiva — assim que
 * o backend passar a enviá-lo, a paginação numérica completa passa a funcionar
 * sem precisar mexer em mais nada aqui.
 */
export async function fetchProducts(params: ProductsQueryParams): Promise<ProductsPage> {
  const searchParams = new URLSearchParams();

  if (params.name) searchParams.set('name', params.name);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.subcategoryId) searchParams.set('subcategoryId', params.subcategoryId);
  searchParams.set('page', String(params.page));

  const data = await apiClient<Product[]>(`/products?${searchParams.toString()}`, {
    method: 'GET',
  });

  return {
    data,
    page: params.page,
  };
}
