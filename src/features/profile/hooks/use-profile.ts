import { useQuery } from "@tanstack/react-query";
import { profileQuery } from "@/lib/profile-query";

export function useProfile(accessToken: string | null) {
  return useQuery(profileQuery(accessToken));
}
