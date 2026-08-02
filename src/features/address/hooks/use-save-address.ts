import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveAddress, type AddressInput } from "../api/address";

export function useSaveAddress(accessToken: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      addressId,
      ...input
    }: AddressInput & { addressId?: string }) =>
      saveAddress(input, accessToken!, addressId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}
