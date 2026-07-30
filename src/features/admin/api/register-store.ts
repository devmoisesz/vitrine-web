import { apiClient } from "@/lib/api-client";

export interface RegisterStoreInput {
  store_name: string;
  store_email: string;
  owner_email: string;
  whatsapp: string;
}

export function registerStore(input: RegisterStoreInput) {
  return apiClient<void>("/store", {
    method: "POST",
    body: input,
    authenticated: true,
    credentials: "include",
  });
}
