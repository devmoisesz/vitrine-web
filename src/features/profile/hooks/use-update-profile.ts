import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../api/profile";

export function useUpdateProfile(accessToken: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; email: string }) =>
      updateProfile(input, accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}
