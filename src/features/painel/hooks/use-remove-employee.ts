import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeEmployee } from "../api/store";

export function useRemoveEmployee(slug: string | undefined, accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: string) => removeEmployee(slug!, employeeId, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["painel", "employees", slug] });
    },
  });
}
