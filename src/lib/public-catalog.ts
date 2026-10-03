import { API_URL, ApiError } from "./api-client";

/** Same-origin public reads, retaining the API's status and scoped count. */
export async function publicCatalog<T>(path: string) {
  const base = typeof window === "undefined" ? API_URL : "/api/catalog";
  const response = await fetch(`${base}${path}`, { credentials: "omit", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new ApiError("Não foi possível carregar os dados. Tente novamente.", response.status);
  const count = response.headers.get("X-Total-Count");
  return { data: await response.json() as T, totalCount: count !== null && /^\d+$/.test(count) ? Number(count) : undefined };
}
