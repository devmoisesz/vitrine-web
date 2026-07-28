import type { Product } from "@/types/catalog";
import { ProductCard } from "@/components/product/product-card";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  searchTerm?: string;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function ProductGrid({
  products,
  isLoading,
  isError,
  searchTerm,
  onRetry,
  onClearFilters,
}: ProductGridProps) {
  if (isError) {
    return (
      <div
        data-slot="product-grid-error"
        className="flex flex-col items-center gap-3 py-24 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os produtos.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium underline underline-offset-4"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        data-slot="product-grid-skeleton"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[3/4] w-full animate-pulse bg-muted" />
            <div className="h-3 w-3/4 animate-pulse bg-muted" />
            <div className="h-3 w-1/3 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        data-slot="product-grid-empty"
        className="flex flex-col items-center gap-3 py-24 text-center"
      >
        <p className="text-sm text-muted-foreground">
          {searchTerm
            ? `Nenhum produto encontrado para "${searchTerm}".`
            : "Nenhum produto encontrado."}
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm font-medium underline underline-offset-4"
        >
          Limpar filtros
        </button>
      </div>
    );
  }

  return (
    <div
      data-slot="product-grid"
      className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
