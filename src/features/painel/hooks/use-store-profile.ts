import { useProfile } from "@/features/profile/hooks/use-profile";

export function useStoreProfile(accessToken: string | null) {
  return useProfile(accessToken);
}
