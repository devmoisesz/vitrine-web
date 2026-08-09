import { useQuery } from "@tanstack/react-query";
import { fetchHomeStores } from "@/features/home/api/fetch-home-stores";
import type { HomeStoresPage } from "@/types/home";

export function useHomeStores(page: number, initialData?: HomeStoresPage) {
  return useQuery({
    queryKey: ["home-stores", page],
    queryFn: () => fetchHomeStores(page),
    initialData,
    placeholderData: (previousData) => previousData,
  });
}
