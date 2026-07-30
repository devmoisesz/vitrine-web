import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerStore } from "../api/register-store";

export function useRegisterStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerStore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "recent-stores"] }),
  });
}
