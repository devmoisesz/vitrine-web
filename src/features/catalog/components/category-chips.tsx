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

  return (
    <div
      data-slot="category-chips"
      className="border-b border-gray-200 bg-white/70 py-3 md:hidden"
    >
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <Chip
          label="Todas"
          active={!activeCategoryId}
          onClick={() => goToFilter(undefined, undefined)}
        />
        {categories?.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            active={activeCategoryId === category.id}
            onClick={() => goToFilter(category.id, undefined)}
          />
        ))}
      </div>

      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
          {activeCategory.subcategories.map((subcategory) => (
            <Chip
              key={subcategory.id}
              label={subcategory.name}
              active={activeSubcategoryId === subcategory.id}
              onClick={() => goToFilter(activeCategory.id, subcategory.id)}
              subtle
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  subtle?: boolean;
}

function Chip({ label, active, onClick, subtle }: ChipProps) {
  return (
    <button
      type="button"
      data-slot="category-chip"
      onClick={onClick}
      className={twMerge(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition",
        subtle ? "text-gray-600" : "text-black",
        active
          ? "border-black bg-black text-white"
          : "border-gray-200 bg-white text-gray-700",
      )}
    >
      {label}
    </button>
  );
}
