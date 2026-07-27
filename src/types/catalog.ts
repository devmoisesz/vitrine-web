export interface StoreSummary {
  id: string;
  name: string;
  slug: string;
  /**
   * Inconsistência conhecida na API: /products retorna `logo_url`, mas /carts
   * retorna `logo_image_url` para o mesmo dado. Trate os dois campos até o
   * backend padronizar.
   */
  logo_url?: string | null;
  logo_image_url?: string | null;
}

export interface ProductImage {
  id?: string;
  image_url: string;
  is_main?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** A API retorna preço como string decimal (ex: "69.79") */
  price: string;
  sizes: string[];
  stock: number;
  status: 'ATIVO' | 'INATIVO';
  storeId: string;
  categoryId: string;
  subcategoryId: string;
  createdAt: string;
  store: StoreSummary;
  products_images: ProductImage[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  createdAt: string;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export interface ProductsQueryParams {
  name?: string;
  categoryId?: string;
  subcategoryId?: string;
  page: number;
}

/**
 * GET /products hoje devolve apenas um array, sem total/totalPages.
 * Este tipo já modela o formato "ideal" (com X-Total-Count via header),
 * mas o hook trata a ausência do header com um modo degradado.
 */
export interface ProductsPage {
  data: Product[];
  page: number;
  /** undefined enquanto o backend não expõe o total (ver nota no header X-Total-Count) */
  totalCount?: number;
}

function getStoreLogo(store: StoreSummary): string | null {
  return store.logo_url ?? store.logo_image_url ?? null;
}

export function getMainImage(product: Product): string | null {
  const main = product.products_images.find((img) => img.is_main);
  return main?.image_url ?? product.products_images[0]?.image_url ?? null;
}

export { getStoreLogo };
