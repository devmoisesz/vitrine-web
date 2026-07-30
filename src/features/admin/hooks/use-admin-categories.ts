import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminCategories, registerCategory, registerSubcategory, updateCategory, updateSubcategory } from "../api/categories";

function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };
}

export function useAdminCategories() {
  return useQuery({ queryKey: ["admin", "categories"], queryFn: fetchAdminCategories });
}

export function useRegisterSubcategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: registerSubcategory,
    onSuccess: invalidate,
  });
}

export function useRegisterCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: registerCategory,
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({ mutationFn: updateCategory, onSuccess: invalidate });
}

export function useUpdateSubcategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({ mutationFn: updateSubcategory, onSuccess: invalidate });
}
