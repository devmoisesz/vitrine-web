"use client";

import { useCategories } from "@/features/catalog/hooks/use-categories";

interface ChainedCategorySelectProps {
  category: string;
  subcategory: string;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
}

/**
 * Dropdowns encadeados de Categoria → Subcategoria.
 * A subcategoria só habilita após selecionar uma categoria.
 * Usa o hook useCategories (GET /categories) como fonte de dados.
 */
export function ChainedCategorySelect({
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
}: ChainedCategorySelectProps) {
  const { data: categories, isLoading, isError } = useCategories();

  const selectedCategory = categories?.find((c) => c.name === category);
  const subcategories = selectedCategory?.subcategories ?? [];

  const selectBase =
    "h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-black outline-none transition-[border-color] duration-200 focus:border-black disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Categoria */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-500">
          Categoria <span className="text-red-500">*</span>
        </label>
        {isLoading ? (
          <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
        ) : isError ? (
          <p className="text-xs text-red-500">Erro ao carregar categorias.</p>
        ) : (
          <select
            value={category}
            onChange={(e) => {
              onCategoryChange(e.target.value);
              onSubcategoryChange(""); // reseta subcategoria
            }}
            className={selectBase}
          >
            <option value="">Selecione uma categoria</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Subcategoria */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-500">
          Subcategoria <span className="text-red-500">*</span>
        </label>
        <select
          value={subcategory}
          onChange={(e) => onSubcategoryChange(e.target.value)}
          disabled={!category}
          className={selectBase}
        >
          <option value="">
            {category
              ? "Selecione uma subcategoria"
              : "Escolha uma categoria primeiro"}
          </option>
          {subcategories.map((sub) => (
            <option key={sub.id} value={sub.name}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
