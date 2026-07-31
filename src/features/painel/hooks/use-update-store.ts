import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStore, type UpdateStoreInput } from "../api/store";

export function useUpdateStore(slug: string | undefined, accessToken: string | null) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: UpdateStoreInput) => updateStore(slug!, input, accessToken!), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["painel", "store-settings", slug] }) });
}
