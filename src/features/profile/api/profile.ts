import { apiClient } from "@/lib/api-client";
import type { Address } from "@/features/address/api/address";

export interface Profile {
  user_name: string;
  user_email: string;
  user_role: string;
  provider: "LOCAL" | "GOOGLE";
  user_address: Address[];
}

const authenticated = (accessToken: string) => ({
  authenticated: true,
  accessToken,
  credentials: "include" as const,
});

export function getProfile(accessToken: string) {
  return apiClient<Profile>("/me", {
    method: "GET",
    ...authenticated(accessToken),
  });
}

export function updateProfile(
  input: { name: string; email: string },
  accessToken: string,
) {
  return apiClient<void>("/account/edit", {
    method: "PUT",
    body: input,
    ...authenticated(accessToken),
  });
}

export function changePassword(
  input: { currentPassword: string; newPassword: string },
  accessToken: string,
) {
  return apiClient<void>("/account/password", {
    method: "PATCH",
    body: input,
    ...authenticated(accessToken),
  });
}
