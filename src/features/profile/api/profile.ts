import { apiClient } from "@/lib/api-client";

export interface Address {
  id: string;
  label: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string | null;
}

export interface Profile {
  user_name: string;
  user_email: string;
  user_role: string;
  provider: "LOCAL" | "GOOGLE";
  user_address: Address[];
}

export interface AddressInput {
  label: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
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

export function getAddresses(accessToken: string) {
  return apiClient<Address[]>("/me/addresses?page=1", {
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

export function saveAddress(
  input: AddressInput,
  accessToken: string,
  addressId?: string,
) {
  return apiClient<void>(
    addressId ? `/me/addressess/${addressId}` : "/address/register",
    {
      method: addressId ? "PUT" : "POST",
      body: input,
      ...authenticated(accessToken),
    },
  );
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
