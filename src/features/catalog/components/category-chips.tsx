"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useCategories } from "@/features/catalog/hooks/use-categories";

export function CategoryChips() {
  const { data: categories } = useCategories();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategoryId = searchParams.get("categoryId");
  const activeSubcategoryId = searchParams.get("subcategoryId");
  const activeCategory = categories?.find(
    (category) => category.id === activeCategoryId,
  );

  function goToFilter(categoryId?: string, subcategoryId?: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) params.set("categoryId", categoryId);
    else params.delete("categoryId");

    if (subcategoryId) params.set("subcategoryId", subcategoryId);
    else params.delete("subcategoryId");

    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  const chipClass = (active: boolean) =>
    twMerge(
      "shrink-0 whitespace-nowrap border px-3 py-1.5 text-xs transition-colors",
      active
        ? "border-foreground bg-foreground text-background"
        : "border-border text-muted-foreground",
    );

  return (
    <div className="flex flex-col gap-2 border-b border-border py-3">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => goToFilter(undefined, undefined)}
          className={chipClass(!activeCategoryId)}
        >
          Todos
        </button>
        {categories?.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => goToFilter(category.id, undefined)}
            className={chipClass(activeCategoryId === category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeCategory.subcategories.map((subcategory) => (
            <button
              key={subcategory.id}
              type="button"
              onClick={() =>
                goToFilter(
                  activeCategory.id,
                  activeSubcategoryId === subcategory.id
                    ? undefined
                    : subcategory.id,
                )
              }
              className={chipClass(activeSubcategoryId === subcategory.id)}
            >
              {subcategory.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
