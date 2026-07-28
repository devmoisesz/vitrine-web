"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useCategories } from "@/features/catalog/hooks/use-categories";
import type { CategoryWithSubcategories } from "@/types/catalog";

export function CategorySidebar() {
  const { data: categories } = useCategories();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategoryId = searchParams.get("categoryId");
  const activeSubcategoryId = searchParams.get("subcategoryId");

  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    activeCategoryId,
  );

  function goToFilter(categoryId?: string, subcategoryId?: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }

    if (subcategoryId) {
      params.set("subcategoryId", subcategoryId);
    } else {
      params.delete("subcategoryId");
    }

    params.delete("page");
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
    <nav
      data-slot="category-sidebar"
      aria-label="Categorias"
      className="hidden w-64 shrink-0 md:block"
    >
      <div className="rounded-[1.5rem] border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">
          Categorias
        </p>
        <ul className="flex flex-col gap-1">
          <li>
            <button
              type="button"
              onClick={() => {
                setExpandedCategoryId(null);
                goToFilter(undefined, undefined);
              }}
              className={twMerge(
                "w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-gray-50",
                !activeCategoryId
                  ? "bg-gray-100 font-semibold text-black"
                  : "text-gray-700",
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
                  "w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-gray-50",
                  activeCategoryId === category.id && !activeSubcategoryId
                    ? "bg-gray-100 font-semibold text-black"
                    : "text-gray-700",
                )}
              >
                {category.name}
              </button>

              {expandedCategoryId === category.id &&
                category.subcategories.length > 0 && (
                  <ul className="ml-3 mt-1 flex flex-col gap-1 border-l border-gray-200 pl-3">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory.id}>
                        <button
                          type="button"
                          onClick={() =>
                            goToFilter(category.id, subcategory.id)
                          }
                          className={twMerge(
                            "w-full rounded-lg px-2 py-1.5 text-left text-sm text-gray-500 transition hover:bg-gray-50 hover:text-black",
                            activeSubcategoryId === subcategory.id &&
                              "bg-gray-50 font-medium text-black",
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
      </div>
    </nav>
  );
}
