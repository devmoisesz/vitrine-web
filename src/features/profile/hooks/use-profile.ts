import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../api/profile";

export function useProfile(accessToken: string | null) {
  return useQuery({
    queryKey: ["profile", accessToken],
    queryFn: () => getProfile(accessToken!),
    enabled: Boolean(accessToken),
  });
}
