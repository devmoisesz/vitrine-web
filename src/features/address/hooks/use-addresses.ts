import { useQuery } from "@tanstack/react-query";
import { getAddresses } from "../api/address";

export function useAddresses(accessToken: string | null) {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => getAddresses(accessToken!),
    enabled: Boolean(accessToken),
  });
}
