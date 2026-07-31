import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleProductStatus } from "../api/store";

export function useToggleProductStatus(
  slug: string | undefined,
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      status,
    }: {
      productId: string;
      status: "ATIVO" | "INATIVO";
    }) => toggleProductStatus(slug!, productId, status, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["painel", "manage-products", slug],
      });
      queryClient.invalidateQueries({ queryKey: ["painel", "metrics", slug] });
    },
  });
}
