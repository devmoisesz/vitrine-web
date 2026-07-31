"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ProductForm,
  type ProductFormValues,
} from "@/components/painel/product-form";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useStoreProfile } from "@/features/painel/hooks/use-store-profile";
import { useUpdateProduct } from "@/features/painel/hooks/use-update-product";
import { useManageProducts } from "@/features/painel/hooks/use-manage-products";

export default function PainelProdutoEditarPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const { accessToken } = useAuth();
  const profile = useStoreProfile(accessToken);
  const slug = profile.data?.store_slug;

  // Busca todos os produtos para encontrar o que está sendo editado
  const { data: products, isLoading } = useManageProducts(slug, accessToken);
  const product = products?.find((p) => p.id === params.productId);

  const updateMutation = useUpdateProduct(slug, params.productId, accessToken);

  async function handleSubmit(data: ProductFormValues) {
    if (!slug || !accessToken) return;

    try {
      // Atualização parcial: só envia campos alterados.
      // O formulário usa nomes (não IDs) para categoria/subcategoria,
      // enquanto product.categoryId é UUID — a comparação sempre resulta
      // em "alterado", o que é aceitável (envia o nome mesmo se for o mesmo).
      const changes: import("@/features/painel/api/store").UpdateProductBody =
        {};

      if (data.name_product !== product?.name) {
        changes.newNameProduct = data.name_product;
      }
      if (data.description !== product?.description) {
        changes.newDescription = data.description;
      }
      if (data.price !== Number(product?.price)) {
        changes.newPrice = data.price;
      }
      if (data.stock !== product?.stock) {
        changes.newStock = data.stock;
      }

      // Arrays: comparação simples por join
      if (data.sizes.join(",") !== (product?.sizes ?? []).join(",")) {
        changes.newSizes = data.sizes;
      }

      // Tags não estão disponíveis no Product type de listagem,
      // então sempre enviamos (o backend só atualiza se houver diferença)
      changes.newTags = data.tags;

      // categoryId/subcategoryId são UUIDs, mas o formulário trabalha com nomes.
      // Sempre envia os nomes para o backend resolver.
      changes.newCategory = data.name_category;
      changes.newSubcategory = data.name_subcategory;

      await updateMutation.mutateAsync(changes);

      toast.success("Produto atualizado com sucesso!");
      router.push("/painel/produtos");
    } catch {
      toast.error("Não foi possível atualizar o produto. Tente novamente.");
    }
  }

  // Mapeia o produto buscado para os valores iniciais do formulário
  const defaultValues: Partial<ProductFormValues> | undefined = product
    ? {
        name_product: product.name,
        description: product.description,
        price: Number(product.price),
        stock: product.stock,
        sizes: product.sizes,
        tags: [], // Tags não estão disponíveis no Product type
        name_category: "", // categoryId é ID, mas formulário usa nome
        name_subcategory: "", // subcategoryId é ID
      }
    : undefined;

  return (
    <ProductForm
      title="Editar produto"
      submitLabel="Salvar alterações"
      defaultValues={defaultValues}
      isLoadingInitial={isLoading}
      isSubmitting={updateMutation.isPending}
      submitError={updateMutation.isError ? "Erro ao atualizar produto." : null}
      onSubmit={handleSubmit}
    />
  );
}
