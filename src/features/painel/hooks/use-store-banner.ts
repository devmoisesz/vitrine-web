import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changeStoreBanner,
  deleteStoreBanner,
  uploadStoreBanner,
} from "../api/store";

function useInvalidate(slug: string | undefined) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ["painel", "store-settings", slug],
    });
}
export function useUploadStoreBanner(
  slug: string | undefined,
  accessToken: string | null,
) {
  const invalidate = useInvalidate(slug);
  return useMutation({
    mutationFn: (file: File) => uploadStoreBanner(slug!, file, accessToken!),
    onSuccess: invalidate,
  });
}
export function useChangeStoreBanner(
  slug: string | undefined,
  accessToken: string | null,
) {
  const invalidate = useInvalidate(slug);
  return useMutation({
    mutationFn: (file: File) => changeStoreBanner(slug!, file, accessToken!),
    onSuccess: invalidate,
  });
}
export function useDeleteStoreBanner(
  slug: string | undefined,
  accessToken: string | null,
) {
  const invalidate = useInvalidate(slug);
  return useMutation({
    mutationFn: () => deleteStoreBanner(slug!, accessToken!),
    onSuccess: invalidate,
  });
}
