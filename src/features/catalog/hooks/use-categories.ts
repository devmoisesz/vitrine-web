import { useQuery } from '@tanstack/react-query';
import { fetchCategoriesWithSubcategories } from '../api/fetch-categories';
import type { CategoryWithSubcategories } from '@/types/catalog';

export function useCategories(initialData?: CategoryWithSubcategories[]) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesWithSubcategories,
    initialData,
    // Categorias e subcategorias são cadastradas só pelo Admin — mudam raramente,
    // não precisa refetch agressivo.
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}
