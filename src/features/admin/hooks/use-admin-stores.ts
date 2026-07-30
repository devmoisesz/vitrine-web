import { useQuery } from "@tanstack/react-query";
import { fetchStores } from "../api/fetch-stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStoreStatus } from "../api/update-store-status";

export function useAdminStores(page = 1) {
  return useQuery({ queryKey: ["admin", "stores", page], queryFn: () => fetchStores(page) });
}

export function useUpdateStoreStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoreStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stores"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "recent-stores"] });
    },
  });
}
