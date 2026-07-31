import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerCollaborator, type RegisterCollaboratorInput } from "../api/store";

export function useRegisterEmployee(slug: string | undefined, accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterCollaboratorInput) =>
      registerCollaborator(slug!, input, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["painel", "employees", slug] });
    },
  });
}
