import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct, type UpdateProductBody } from "../api/store";

export function useUpdateProduct(
  slug: string | undefined,
  productId: string,
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProductBody) =>
      updateProduct(slug!, productId, body, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["painel", "manage-products", slug],
      });
      queryClient.invalidateQueries({ queryKey: ["painel", "metrics", slug] });
    },
  });
}
