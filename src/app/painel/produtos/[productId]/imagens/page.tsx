"use client";

import { useParams } from "next/navigation";
import { ProductImageManager } from "@/components/product/product-image-manager";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useStoreProfile } from "@/features/painel/hooks/use-store-profile";

export default function PainelProdutoImagensPage() {
  const params = useParams<{ productId: string }>();
  const { accessToken } = useAuth();
  const profile = useStoreProfile(accessToken);
  const slug = profile.data?.store_slug;

  if (!slug || !accessToken) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ProductImageManager
        slug={slug}
        productId={params.productId}
        accessToken={accessToken}
      />
    </div>
  );
}
