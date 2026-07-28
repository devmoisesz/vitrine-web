"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAddToCart } from "@/features/cart/hooks/use-add-to-cart";
import { getMainImage } from "@/types/catalog";
import type { Product } from "@/types/catalog";
import { ProductCardImage } from "./product-card-image";
import { ProductCardInfo } from "./product-card-info";
import { ProductCardPrice } from "./product-card-price";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();
  const { mutate: addToCart, isPending } = useAddToCart();

  const isOutOfStock = product.stock <= 0;
  const requiresSizeSelection = product.sizes.length > 0;
  const mainImage = getMainImage(product);

  function handleAddToCart(event: React.MouseEvent) {
    // Impede que o clique no ícone também dispare a navegação do Link envolvente
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      // Regra de negócio: só é possível adicionar ao carrinho estando logado
      router.push(`/login?next=/produto/${product.id}`);
      return;
    }

    if (isOutOfStock) return;

    if (requiresSizeSelection) {
      // Produto tem tamanhos — a seleção precisa acontecer na página de detalhe,
      // não dá pra "adicionar rápido" pelo card sem essa escolha
      router.push(`/produto/${product.id}`);
      return;
    }

    addToCart({ productId: product.id, accessToken: accessToken! });
  }

  return (
    <Link
      href={`/produto/${product.id}`}
      data-slot="product-card"
      className="group flex flex-col gap-3"
    >
      <ProductCardImage
        imageUrl={mainImage}
        productName={product.name}
        isOutOfStock={isOutOfStock}
      />

      <div className="flex items-start justify-between gap-2">
        <ProductCardInfo
          productName={product.name}
          storeName={product.store.name}
        />

        <button
          type="button"
          aria-label={
            !isAuthenticated
              ? "Entrar para adicionar ao carrinho"
              : requiresSizeSelection
                ? "Escolher tamanho"
                : "Adicionar ao carrinho"
          }
          onClick={handleAddToCart}
          disabled={isOutOfStock || isPending}
          data-disabled={isOutOfStock || isPending ? "" : undefined}
          className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-30"
        >
          <ShoppingBag className="size-4" />
        </button>
      </div>

      <ProductCardPrice price={product.price} />
    </Link>
  );
}
