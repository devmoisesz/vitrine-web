import { apiClient } from "@/lib/api-client";

export interface RegisterStoreInput {
  store_name: string;
  store_email?: string | null;
  owner_email: string;
  whatsapp: string;
}

export function registerStore(input: RegisterStoreInput) {
  const storeEmail = input.store_email?.trim();

  return apiClient<void>("/store", {
    method: "POST",
    body: {
      store_name: input.store_name,
      owner_email: input.owner_email,
      whatsapp: input.whatsapp,
      ...(storeEmail ? { store_email: storeEmail.toLowerCase() } : {}),
    },
    authenticated: true,
    credentials: "include",
  });
}
