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
  /** WhatsApp da loja para contato. */
  whatsapp?: string | null;
  /** Disponíveis no retorno de /carts quando a API os expuser. */
  payment_methods?: string[];
  delivery_methods?: string[];
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
  status: "ATIVO" | "INATIVO";
  storeId: string;
  categoryId: string;
  subcategoryId: string;
  createdAt: string;
  /**
   * Ausente em alguns endpoints (ex: /home/stores), que retornam produtos sem
   * o objeto `store` aninhado. Presente em /products e demais fluxos que
   * precisam do nome/slug da loja.
   */
  store?: StoreSummary;
  /**
   * Ausente em alguns endpoints (ex: /home/stores). `getMainImage` já trata a
   * ausência de forma defensiva.
   */
  products_images?: ProductImage[];
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
  // Alguns endpoints (ex: /home/stores) podem retornar produtos sem a lista
  // de imagens preenchida — trata a ausência de forma defensiva.
  const images = product.products_images ?? [];
  const main = images.find((img) => img.is_main);
  return main?.image_url ?? images[0]?.image_url ?? null;
}

export type UserRole = "Admin" | "Cliente" | "Proprietário" | "Funcionário";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  selectedSize: string | null;
  product: {
    id?: string;
    name: string;
    price: string;
    stock?: number;
    sizes?: string[];
    products_images: ProductImage[];
  };
}

export interface Cart {
  id: string;
  userId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  store: StoreSummary;
  cart_items: CartItem[];
}

export interface Address {
  id?: string;
  label: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string | null;
}

export interface Profile {
  user_name: string;
  user_email: string;
  user_role: UserRole;
  store_name?: string | null;
  store_address?: Address | null;
  user_address?: Address[];
}

export { getStoreLogo };
