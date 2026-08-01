import { useQuery } from "@tanstack/react-query";
import { getManageProducts } from "../api/store";

export function useManageProducts(
  slug: string | undefined,
  accessToken: string | null,
  params?: { status?: string; page?: number },
) {
  const page = params?.page ?? 1;
  const status = params?.status;

  return useQuery({
    queryKey: ["painel", "manage-products", slug, status, page, accessToken],
    queryFn: () => getManageProducts(slug!, accessToken!, { status, page }),
    enabled: Boolean(slug && accessToken),
  });
}
