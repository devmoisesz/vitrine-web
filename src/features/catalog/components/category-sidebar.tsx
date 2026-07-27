'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useCategories } from '@/features/catalog/hooks/use-categories';
import type { CategoryWithSubcategories } from '@/types/catalog';

export function CategorySidebar() {
  const { data: categories } = useCategories();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategoryId = searchParams.get('categoryId');
  const activeSubcategoryId = searchParams.get('subcategoryId');

  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(activeCategoryId);

  function goToFilter(categoryId?: string, subcategoryId?: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) {
      params.set('categoryId', categoryId);
    } else {
      params.delete('categoryId');
    }

    if (subcategoryId) {
      params.set('subcategoryId', subcategoryId);
    } else {
      params.delete('subcategoryId');
    }

    params.delete('page');
    router.push(`/?${params.toString()}`);
  }

  function handleCategoryClick(category: CategoryWithSubcategories) {
    const isExpanded = expandedCategoryId === category.id;

    if (isExpanded) {
      setExpandedCategoryId(null);
      if (activeCategoryId === category.id) goToFilter(undefined, undefined);
      return;
    }

    setExpandedCategoryId(category.id);
    goToFilter(category.id, undefined);
  }

  return (
    <nav data-slot="category-sidebar" aria-label="Categorias" className="hidden w-60 shrink-0 md:block">
      <ul className="flex flex-col gap-1">
        <li>
          <button
            type="button"
            onClick={() => {
              setExpandedCategoryId(null);
              goToFilter(undefined, undefined);
            }}
            className={twMerge(
              'w-full py-2 text-left text-sm hover:font-medium',
              !activeCategoryId && 'font-medium',
            )}
          >
            Todas as categorias
          </button>
        </li>

        {categories?.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => handleCategoryClick(category)}
              className={twMerge(
                'w-full py-2 text-left text-sm hover:font-medium',
                activeCategoryId === category.id && !activeSubcategoryId && 'font-medium',
              )}
            >
              {category.name}
            </button>

            {expandedCategoryId === category.id && category.subcategories.length > 0 && (
              <ul className="ml-3 flex flex-col gap-1 border-l border-gray-200 pl-3">
                {category.subcategories.map((subcategory) => (
                  <li key={subcategory.id}>
                    <button
                      type="button"
                      onClick={() => goToFilter(category.id, subcategory.id)}
                      className={twMerge(
                        'w-full py-1.5 text-left text-sm text-gray-500 hover:text-black',
                        activeSubcategoryId === subcategory.id && 'font-medium text-black',
                      )}
                    >
                      {subcategory.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
