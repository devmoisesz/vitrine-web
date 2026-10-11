import { queryOptions } from "@tanstack/react-query";
import { getProfile } from "@/features/profile/api/profile";
import { ApiError } from "./api-client";

// This is a cache key only. Authorization is always performed by the API.
export function profileIdentity(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.sub === "string" && typeof payload.sid === "string") {
      return JSON.stringify([payload.sub, payload.sid]);
    }
  } catch { /* Opaque or malformed tokens must not share a cache entry. */ }
  return token;
}

export function profileQuery(accessToken: string | null) {
  return queryOptions({
    queryKey: ["profile", profileIdentity(accessToken)],
    queryFn: () => getProfile(accessToken!),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
    gcTime: 60_000,
    refetchOnWindowFocus: false,
    retry: (failures, error) => !(error instanceof ApiError && [401, 403, 429].includes(error.status)) && failures < 2,
  });
}
