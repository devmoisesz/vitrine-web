import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminCategories, registerCategory, registerSubcategory } from "../api/categories";

export function useAdminCategories() {
  return useQuery({ queryKey: ["admin", "categories"], queryFn: fetchAdminCategories });
}

export function useRegisterSubcategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useRegisterCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
