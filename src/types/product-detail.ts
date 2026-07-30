import type { ProductImage, StoreSummary } from "@/types/catalog";

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  sizes: string[];
  stock: number;
  status: "ATIVO" | "INATIVO";
  storeId: string;
  categoryId: string;
  subcategoryId: string;
  createdAt: string;
  store: StoreSummary;
}

export interface ProductDetailResponse {
  product: ProductDetail;
  images: ProductImage[];
}
