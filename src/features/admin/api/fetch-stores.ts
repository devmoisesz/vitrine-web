import { apiClient } from "@/lib/api-client";

export interface AdminStore {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  whatsapp: string | null;
  active: boolean;
  createdAt: string | null;
}

type StorePayload = {
  id?: string;
  name?: string;
  store_name?: string;
  slug?: string;
  email?: string | null;
  store_email?: string | null;
  whatsapp?: string | null;
  status?: string;
  active?: boolean;
  isActive?: boolean;
  createdAt?: string;
  created_at?: string;
};

function toAdminStore(store: StorePayload): AdminStore {
  return {
    id: store.id ?? store.name ?? crypto.randomUUID(),
    name: store.name ?? store.store_name ?? "Loja sem nome",
    slug: store.slug ?? "",
    email: store.email ?? store.store_email ?? null,
    whatsapp: store.whatsapp ?? null,
    active: store.active ?? store.isActive ?? ["ATIVO", "ACTIVE", "ATIVA"].includes(store.status?.toUpperCase() ?? ""),
    createdAt: store.createdAt ?? store.created_at ?? null,
  };
}

export async function fetchStores(page = 1): Promise<AdminStore[]> {
  const result = await apiClient<StorePayload[] | { data?: StorePayload[]; stores?: StorePayload[] }>(
    `/stores?page=${page}`,
    { method: "GET", credentials: "include" },
  );
  const stores = Array.isArray(result) ? result : (result.data ?? result.stores ?? []);
  return stores.map(toAdminStore);
}

export async function fetchRecentStores(): Promise<AdminStore[]> {
  return (await fetchStores(1)).slice(0, 10);
}
