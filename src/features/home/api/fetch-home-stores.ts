import { API_URL, ApiError } from "@/lib/api-client";
import type { HomeStoresPage } from "@/types/home";

export async function fetchHomeStores(page: number): Promise<HomeStoresPage> {
  const response = await fetch(`${API_URL}/home/stores?page=${page}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError("Não foi possível carregar as lojas.", response.status);
  }

  const totalHeader = response.headers.get("X-Total-Count");
  const parsedTotal = totalHeader ? Number.parseInt(totalHeader, 10) : Number.NaN;

  return {
    data: await response.json(),
    page,
    totalCount: Number.isFinite(parsedTotal) ? parsedTotal : undefined,
  };
}
