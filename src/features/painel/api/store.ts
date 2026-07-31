import { apiClient } from "@/lib/api-client";
import type { Order } from "@/types/orders";

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
  return apiClient<Order[]>(`/store/${encodeURIComponent(slug)}/orders?page=1`, {
    method: "GET",
    ...authenticated(accessToken),
  });
}

// Rota de colaboradores padronizada com slug (docs/checkout.md, linha 121).
export function registerCollaborator(
  slug: string,
  input: { name: string; email: string; password: string; role: string },
  accessToken: string,
) {
  return apiClient<void>(`/stores/${encodeURIComponent(slug)}/collaborators`, {
    method: "POST",
    body: input,
    ...authenticated(accessToken),
  });
}
