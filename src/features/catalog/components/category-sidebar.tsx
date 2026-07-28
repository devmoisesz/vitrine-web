"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown } from "lucide-react";
import { useCategories } from "@/features/catalog/hooks/use-categories";
import type { CategoryWithSubcategories } from "@/types/catalog";

export function CategorySidebar() {
  const { data: categories, isLoading } = useCategories();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategoryId = searchParams.get("categoryId") ?? undefined;
  const activeSubcategoryId = searchParams.get("subcategoryId") ?? undefined;

  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    activeCategoryId ?? null,
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

  const buttonBase =
    "w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted";

  return (
    <nav aria-label="Categorias" className="w-full">
      <p className="eyebrow mb-4 text-muted-foreground">Categorias</p>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      )}

      <ul className="flex flex-col gap-1">
        <li>
          <button
            type="button"
            onClick={() => {
              setExpandedCategoryId(null);
              goToFilter(undefined, undefined);
            }}
            className={twMerge(
              buttonBase,
              !activeCategoryId
                ? "bg-accent font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            Todos os produtos
          </button>
        </li>

        {categories?.map((category) => {
          const open = expandedCategoryId === category.id;
          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={twMerge(
                  buttonBase,
                  activeCategoryId === category.id && !activeSubcategoryId
                    ? "bg-accent font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {category.name}
              </button>

              {open && category.subcategories.length > 0 && (
                <ul className="ml-3 mt-1 flex flex-col gap-1 border-l border-border pl-3">
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory.id}>
                      <button
                        type="button"
                        onClick={() => goToFilter(category.id, subcategory.id)}
                        className={twMerge(
                          "w-full rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                          activeSubcategoryId === subcategory.id &&
                            "bg-accent font-medium text-foreground",
                        )}
                      >
                        {subcategory.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
