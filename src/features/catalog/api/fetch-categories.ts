import { apiClient } from '@/lib/api-client';
import type { Category, CategoryWithSubcategories, Subcategory } from '@/types/catalog';

/**
 * A API expõe categorias (GET /categories) e subcategorias (GET /subcategories?categoryId=)
 * como endpoints separados. Este fetcher combina os dois em uma única chamada
 * de conveniência para o sidebar/chips, já aninhando subcategorias em cada categoria.
 */
export async function fetchCategoriesWithSubcategories(): Promise<CategoryWithSubcategories[]> {
  const [categories, allSubcategories] = await Promise.all([
    apiClient<Category[]>('/categories', { method: 'GET' }),
    apiClient<Subcategory[]>('/subcategories', { method: 'GET' }),
  ]);

  return categories.map((category) => ({
    ...category,
    subcategories: allSubcategories.filter((sub) => sub.categoryId === category.id),
  }));
}
