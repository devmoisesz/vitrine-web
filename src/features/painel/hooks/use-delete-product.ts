import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../api/store";

export function useDeleteProduct(
  slug: string | undefined,
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      deleteProduct(slug!, productId, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["painel", "manage-products", slug],
      });
      queryClient.invalidateQueries({ queryKey: ["painel", "metrics", slug] });
    },
  });
}
