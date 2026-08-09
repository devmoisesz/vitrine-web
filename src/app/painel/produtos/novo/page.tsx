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

  if (!slug || !accessToken) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    );
  }

  async function handleSubmit(data: ProductFormValues) {
    if (!slug || !accessToken) {
      toast.error(
        "Aguarde o carregamento dos dados da loja antes de cadastrar o produto.",
      );
      return;
    }

    try {
      const body = {
        name_product: data.name_product,
        description: data.description,
        price: data.price,
        stock: data.stock,
        name_category: data.name_category,
        name_subcategory: data.name_subcategory,
        sizes: data.sizes ?? [],
        tags: data.tags ?? [],
      };

      const result = await createMutation.mutateAsync(body);

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
