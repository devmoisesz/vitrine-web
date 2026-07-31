import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, type CreateProductBody } from "../api/store";

export function useCreateProduct(
  slug: string | undefined,
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProductBody) =>
      createProduct(slug!, body, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["painel", "manage-products", slug],
      });
      queryClient.invalidateQueries({ queryKey: ["painel", "metrics", slug] });
    },
  });
}
