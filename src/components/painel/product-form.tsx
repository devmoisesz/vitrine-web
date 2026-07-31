"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChainedCategorySelect } from "@/components/painel/chained-category-select";
import { SizeChecklist } from "@/components/painel/size-checklist";
import { TagsInput } from "@/components/painel/tags-input";

const productFormSchema = z.object({
  name_product: z.string().min(1, "O nome é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  price: z
    .number({ invalid_type_error: "Preço deve ser um número." })
    .positive("O preço deve ser positivo."),
  stock: z
    .number({ invalid_type_error: "Estoque deve ser um número." })
    .positive("O estoque deve ser positivo."),
  sizes: z.array(z.string()),
  tags: z.array(z.string()),
  name_category: z.string().min(1, "Selecione uma categoria."),
  name_subcategory: z.string().min(1, "Selecione uma subcategoria."),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  /** Título do formulário */
  title: string;
  /** Texto do botão de submit */
  submitLabel: string;
  /** Valores iniciais (para edição) */
  defaultValues?: Partial<ProductFormValues>;
  /** Loading inicial (busca dados para edição) */
  isLoadingInitial?: boolean;
  /** Loading de submissão */
  isSubmitting?: boolean;
  /** Erro de submissão */
  submitError?: string | null;
  /** Callback de submit */
  onSubmit: (data: ProductFormValues) => void;
}

export function ProductForm({
  title,
  submitLabel,
  defaultValues,
  isLoadingInitial,
  isSubmitting,
  submitError,
  onSubmit,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name_product: "",
      description: "",
      price: undefined,
      stock: undefined,
      sizes: [],
      tags: [],
      name_category: "",
      name_subcategory: "",
      ...defaultValues,
    },
  });

  if (isLoadingInitial) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-serif text-3xl sm:text-4xl">{title}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Erro de submissão */}
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        {/* Nome */}
        <div>
          <label
            htmlFor="name_product"
            className="mb-2 block text-sm font-medium text-gray-500"
          >
            Nome <span className="text-red-500">*</span>
          </label>
          <Input id="name_product" {...register("name_product")} />
          {errors.name_product && (
            <p className="mt-1 text-xs text-red-500">
              {errors.name_product.message}
            </p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-500"
          >
            Descrição <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            {...register("description")}
            className="h-auto min-h-[100px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition-[border-color] duration-200 placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-black focus:ring-offset-2"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Preço e Estoque */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-gray-500"
            >
              Preço (R$) <span className="text-red-500">*</span>
            </label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="stock"
              className="mb-2 block text-sm font-medium text-gray-500"
            >
              Estoque <span className="text-red-500">*</span>
            </label>
            <Input
              id="stock"
              type="number"
              step="1"
              min="1"
              {...register("stock", { valueAsNumber: true })}
            />
            {errors.stock && (
              <p className="mt-1 text-xs text-red-500">
                {errors.stock.message}
              </p>
            )}
          </div>
        </div>

        {/* Tamanhos */}
        <Controller
          name="sizes"
          control={control}
          render={({ field }) => (
            <SizeChecklist selected={field.value} onChange={field.onChange} />
          )}
        />

        {/* Tags */}
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagsInput tags={field.value} onChange={field.onChange} />
          )}
        />

        {/* Categoria + Subcategoria */}
        <Controller
          name="name_category"
          control={control}
          render={({ field: catField }) => (
            <Controller
              name="name_subcategory"
              control={control}
              render={({ field: subField }) => (
                <ChainedCategorySelect
                  category={catField.value}
                  subcategory={subField.value}
                  onCategoryChange={catField.onChange}
                  onSubcategoryChange={subField.onChange}
                />
              )}
            />
          )}
        />
        {errors.name_category && (
          <p className="text-xs text-red-500">{errors.name_category.message}</p>
        )}
        {errors.name_subcategory && (
          <p className="text-xs text-red-500">
            {errors.name_subcategory.message}
          </p>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
