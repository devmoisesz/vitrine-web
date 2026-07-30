import { apiClient } from "@/lib/api-client";

export function updateStoreStatus({ slug, active }: { slug: string; active: boolean }) {
  return apiClient<void>(`/stores/${encodeURIComponent(slug)}/${active ? "activate" : "deactivate"}`, {
    method: "PATCH",
    authenticated: true,
    credentials: "include",
  });
}
