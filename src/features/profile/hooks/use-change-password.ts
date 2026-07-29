import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../api/profile";

export function useChangePassword(accessToken: string | null) {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      changePassword(input, accessToken!),
  });
}
