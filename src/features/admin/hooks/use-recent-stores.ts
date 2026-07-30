import { useQuery } from "@tanstack/react-query";
import { fetchRecentStores } from "../api/fetch-stores";

export function useRecentStores() {
  return useQuery({ queryKey: ["admin", "recent-stores"], queryFn: fetchRecentStores });
}
