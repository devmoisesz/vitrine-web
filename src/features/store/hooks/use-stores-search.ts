import { useQuery } from "@tanstack/react-query";
import { fetchStoresSearch, type StoresSearchParams } from "../api/fetch-stores-search";

export function useStoresSearch(params: StoresSearchParams) {
  return useQuery({
    queryKey: ["stores-search", params.name, params.page],
    queryFn: () => fetchStoresSearch(params),
    placeholderData: (previousData) => previousData,
  });
}
