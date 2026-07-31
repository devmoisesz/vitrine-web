import { apiClient } from "@/lib/api-client";
import type { Order } from "@/types/orders";
import type { Product } from "@/types/catalog";

export interface StoreProfile {
  user_name: string;
  user_email: string;
  user_role: string;
  store_name?: string;
  store_slug?: string;
}

export interface StoreProduct {
  id: string;
  status: "ATIVO" | "INATIVO";
}

/** Resposta do POST /stores/:slug/products — retorna o id do produto criado */
export interface CreateProductResponse {
  id: string;
}

/** Body para criar produto — nomenclatura snake_case */
export interface CreateProductBody {
  name_product: string;
  tags: string[];
  description: string;
  price: number;
  sizes: string[];
  stock: number;
  name_category: string;
  name_subcategory: string;
}

/** Body para editar produto — TODOS opcionais, nomenclatura camelCase com prefixo "new" */
export interface UpdateProductBody {
  newNameProduct?: string;
  newTags?: string[];
  newDescription?: string;
  newPrice?: number;
  newSizes?: string[];
  newStock?: number;
  newCategory?: string;
  newSubcategory?: string;
}

/** Produto na listagem de gestão (pode estar ATIVO ou INATIVO) */
export type ManageProduct = Product;

/** Produto detalhado para edição */
export interface ManageProductDetail {
  product: ManageProduct;
}

/** Página de produtos gerenciados */
export interface ManageProductsPage {
  data: ManageProduct[];
  page: number;
}

/** Imagem de produto (do backend) */
export interface ProductImageItem {
  id: string;
  productId: string;
  image_url: string;
  storage_public_id: string;
  is_main: boolean;
  createdAt: string;
}

const authenticated = (accessToken: string) => ({
  authenticated: true,
  accessToken,
  credentials: "include" as const,
});

export function getStoreProfile(accessToken: string) {
  return apiClient<StoreProfile>("/me", {
    method: "GET",
    ...authenticated(accessToken),
  });
}

export function getStoreProducts(slug: string, accessToken: string) {
  return apiClient<StoreProduct[]>(
    `/store/${encodeURIComponent(slug)}/manage/products?status=ATIVO&page=1`,
    { method: "GET", ...authenticated(accessToken) },
  );
}

export function getRecentStoreOrders(slug: string, accessToken: string) {
  return apiClient<Order[]>(
    `/store/${encodeURIComponent(slug)}/orders?page=1`,
    {
      method: "GET",
      ...authenticated(accessToken),
    },
  );
}

// ─── Gestão de Produtos ───────────────────────────────────────────────────

/**
 * GET /store/:slug/manage/products?status=&page=
 * Lista produtos da loja (inclui ATIVO e INATIVO).
 */
export function getManageProducts(
  slug: string,
  accessToken: string,
  params?: { status?: string; page?: number },
) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  searchParams.set("page", String(params?.page ?? 1));

  return apiClient<ManageProduct[]>(
    `/store/${encodeURIComponent(slug)}/manage/products?${searchParams.toString()}`,
    { method: "GET", ...authenticated(accessToken) },
  );
}

/**
 * POST /stores/:slug/products
 * Cria um novo produto.
 * Retorna 201 com { id: string }.
 */
export function createProduct(
  slug: string,
  body: CreateProductBody,
  accessToken: string,
) {
  return apiClient<CreateProductResponse>(
    `/stores/${encodeURIComponent(slug)}/products`,
    { method: "POST", body, ...authenticated(accessToken) },
  );
}

/**
 * PUT /stores/:slug/products/:productId
 * Atualização parcial — TODOS os campos são opcionais.
 * Retorna 204.
 */
export function updateProduct(
  slug: string,
  productId: string,
  body: UpdateProductBody,
  accessToken: string,
) {
  return apiClient<void>(
    `/stores/${encodeURIComponent(slug)}/products/${encodeURIComponent(productId)}`,
    { method: "PUT", body, ...authenticated(accessToken) },
  );
}

/**
 * DELETE /stores/:slug/products/:productId/
 * Remove um produto. Retorna 204.
 */
export function deleteProduct(
  slug: string,
  productId: string,
  accessToken: string,
) {
  return apiClient<void>(
    `/stores/${encodeURIComponent(slug)}/products/${encodeURIComponent(productId)}/`,
    { method: "DELETE", ...authenticated(accessToken) },
  );
}

/**
 * PATCH /stores/:slug/products/:productId/status
 * Ativa ou desativa um produto.
 * Body: { status: "ATIVO" | "INATIVO" }
 * Retorna 204.
 */
export function toggleProductStatus(
  slug: string,
  productId: string,
  status: "ATIVO" | "INATIVO",
  accessToken: string,
) {
  return apiClient<void>(
    `/stores/${encodeURIComponent(slug)}/products/${encodeURIComponent(productId)}/status`,
    { method: "PATCH", body: { status }, ...authenticated(accessToken) },
  );
}

// ─── Gestão de Imagens de Produto ─────────────────────────────────────────

/**
 * POST /stores/:slug/productimages/:productId
 * Upload de nova imagem.
 * FormFile: file. Body opcional: is_main (boolean como string).
 */
export function uploadProductImage(
  slug: string,
  productId: string,
  file: File,
  isMain?: boolean,
  accessToken?: string,
) {
  const formData = new FormData();
  formData.append("file", file);
  if (isMain !== undefined) {
    formData.append("is_main", String(isMain));
  }

  return apiClient<ProductImageItem>(
    `/stores/${encodeURIComponent(slug)}/productimages/${encodeURIComponent(productId)}`,
    {
      method: "POST",
      body: formData,
      ...(accessToken ? authenticated(accessToken) : {}),
      // Não definir Content-Type — o browser define multipart/form-data com boundary
      headers: {},
    },
  );
}

/**
 * PATCH /stores/:slug/productimages/:productId/:imageId
 * Trocar o arquivo de uma imagem existente (preserva is_main).
 */
export function changeProductImage(
  slug: string,
  productId: string,
  imageId: string,
  file: File,
  accessToken?: string,
) {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<ProductImageItem>(
    `/stores/${encodeURIComponent(slug)}/productimages/${encodeURIComponent(productId)}/${encodeURIComponent(imageId)}`,
    {
      method: "PATCH",
      body: formData,
      ...(accessToken ? authenticated(accessToken) : {}),
      headers: {},
    },
  );
}

/**
 * PATCH /stores/:slug/productimages/:productId/:imageId/set-main
 * Marca uma imagem existente como principal (sem upload).
 * Retorna 204.
 */
export function setMainProductImage(
  slug: string,
  productId: string,
  imageId: string,
  accessToken?: string,
) {
  return apiClient<void>(
    `/stores/${encodeURIComponent(slug)}/productimages/${encodeURIComponent(productId)}/${encodeURIComponent(imageId)}/set-main`,
    {
      method: "PATCH",
      ...(accessToken ? authenticated(accessToken) : {}),
    },
  );
}

/**
 * DELETE /stores/:slug/productimages/:productId/:imageId
 * Remove uma imagem. Se era a principal, backend promove automaticamente
 * a mais recente entre as restantes.
 * Retorna 204.
 */
export function deleteProductImage(
  slug: string,
  productId: string,
  imageId: string,
  accessToken?: string,
) {
  return apiClient<void>(
    `/stores/${encodeURIComponent(slug)}/productimages/${encodeURIComponent(productId)}/${encodeURIComponent(imageId)}`,
    {
      method: "DELETE",
      ...(accessToken ? authenticated(accessToken) : {}),
    },
  );
}

// ─── Colaboradores ────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  email: string;
}

export interface RegisterCollaboratorInput {
  name: string;
  email: string;
  password: string;
  role: "FUNCIONARIO";
}

export function getEmployees(slug: string, accessToken: string) {
  return apiClient<Employee[]>(
    `/store/${encodeURIComponent(slug)}/employees?page=1`,
    { method: "GET", ...authenticated(accessToken) },
  );
}

export function registerCollaborator(
  slug: string,
  input: RegisterCollaboratorInput,
  accessToken: string,
) {
  return apiClient<void>(`/stores/${encodeURIComponent(slug)}/collaborators`, {
    method: "POST",
    body: input,
    ...authenticated(accessToken),
  });
}

export function removeEmployee(
  slug: string,
  employeeId: string,
  accessToken: string,
) {
  return apiClient<void>(
    `/store/${encodeURIComponent(slug)}/delete/${encodeURIComponent(employeeId)}`,
    { method: "DELETE", ...authenticated(accessToken) },
  );
}
