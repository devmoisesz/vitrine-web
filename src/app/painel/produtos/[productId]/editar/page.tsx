"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ProductForm,
  type ProductFormValues,
} from "@/components/painel/product-form";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCategories } from "@/features/catalog/hooks/use-categories";
import { useStoreProfile } from "@/features/painel/hooks/use-store-profile";
import { useUpdateProduct } from "@/features/painel/hooks/use-update-product";
import { useManageProducts } from "@/features/painel/hooks/use-manage-products";

export default function PainelProdutoEditarPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const { accessToken } = useAuth();
  const profile = useStoreProfile(accessToken);
  const slug = profile.data?.store_slug;
  const { data: products, isLoading } = useManageProducts(slug, accessToken);
  const categories = useCategories();
  const product = products?.find((item) => item.id === params.productId);
  const updateMutation = useUpdateProduct(slug, params.productId, accessToken);

  const defaultValues = useMemo<Partial<ProductFormValues> | undefined>(() => {
    if (!product || !categories.data) return undefined;

    const category = categories.data.find(
      (item) => item.id === product.categoryId,
    );
    const subcategory = category?.subcategories.find(
      (item) => item.id === product.subcategoryId,
    );

    return {
      name_product: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      sizes: product.sizes,
      tags: [],
      name_category: category?.name ?? "",
      name_subcategory: subcategory?.name ?? "",
    };
  }, [categories.data, product]);

  async function handleSubmit(data: ProductFormValues) {
    if (!slug || !accessToken || !product) return;

    try {
      const changes: import("@/features/painel/api/store").UpdateProductBody =
        {};

      if (data.name_product !== product.name) changes.newNameProduct = data.name_product;
      if (data.description !== product.description) changes.newDescription = data.description;
      if (data.price !== Number(product.price)) changes.newPrice = data.price;
      if (data.stock !== product.stock) changes.newStock = data.stock;
      if (data.sizes.join(",") !== product.sizes.join(",")) changes.newSizes = data.sizes;
      if (data.tags.length > 0) changes.newTags = data.tags;

      changes.newCategory = data.name_category;
      changes.newSubcategory = data.name_subcategory;

      await updateMutation.mutateAsync(changes);
      toast.success("Produto atualizado com sucesso!");
      router.push("/painel/produtos");
    } catch {
      toast.error("Não foi possível atualizar o produto. Tente novamente.");
    }
  }

  if (isLoading || categories.isLoading) {
    return (
      <ProductForm
        title="Editar produto"
        submitLabel="Salvar alterações"
        isLoadingInitial
        onSubmit={handleSubmit}
      />
    );
  }

  if (!product || !defaultValues) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center text-sm text-gray-500">
        Produto não encontrado ou categorias indisponíveis.
      </div>
    );
  }

  return (
    <ProductForm
      key={product.id}
      title="Editar produto"
      submitLabel="Salvar alterações"
      defaultValues={defaultValues}
      isSubmitting={updateMutation.isPending}
      submitError={updateMutation.isError ? "Erro ao atualizar produto." : null}
      onSubmit={handleSubmit}
    />
  );
}
