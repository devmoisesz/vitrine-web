import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveStoreAddress, type StoreAddressInput } from "../api/store";

export function useSaveStoreAddress(slug: string | undefined, hasAddress: boolean, accessToken: string | null) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: StoreAddressInput) => saveStoreAddress(slug!, input, hasAddress, accessToken!), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["painel", "store-settings", slug] }) });
}
