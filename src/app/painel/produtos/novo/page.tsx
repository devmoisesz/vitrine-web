"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ProductForm,
  type ProductFormValues,
} from "@/components/painel/product-form";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useStoreProfile } from "@/features/painel/hooks/use-store-profile";
import { useCreateProduct } from "@/features/painel/hooks/use-create-product";

export default function PainelProdutoNovoPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const profile = useStoreProfile(accessToken);
  const slug = profile.data?.store_slug;
  const createMutation = useCreateProduct(slug, accessToken);

  async function handleSubmit(data: ProductFormValues) {
    if (!slug || !accessToken) return;

    try {
      const result = await createMutation.mutateAsync({
        name_product: data.name_product,
        description: data.description,
        price: data.price,
        stock: data.stock,
        sizes: data.sizes,
        tags: data.tags,
        name_category: data.name_category,
        name_subcategory: data.name_subcategory,
      });

      toast.success("Produto criado com sucesso!");

      // Redireciona para a gestão de imagens do produto recém-criado
      // (regra de negócio: produto nasce sem imagem = não publicado)
      router.push(`/painel/produtos/${result.id}/imagens`);
    } catch {
      toast.error("Não foi possível criar o produto. Tente novamente.");
    }
  }

  return (
    <ProductForm
      title="Cadastrar produto"
      submitLabel="Cadastrar produto"
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      submitError={createMutation.isError ? "Erro ao criar produto." : null}
    />
  );
}
