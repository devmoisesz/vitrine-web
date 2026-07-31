import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeStoreLogo, deleteStoreLogo, uploadStoreLogo } from "../api/store";

function useInvalidate(slug: string | undefined) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["painel", "store-settings", slug] });
}
export function useUploadStoreLogo(slug: string | undefined, accessToken: string | null) { const invalidate = useInvalidate(slug); return useMutation({ mutationFn: (file: File) => uploadStoreLogo(slug!, file, accessToken!), onSuccess: invalidate }); }
export function useChangeStoreLogo(slug: string | undefined, accessToken: string | null) { const invalidate = useInvalidate(slug); return useMutation({ mutationFn: (file: File) => changeStoreLogo(slug!, file, accessToken!), onSuccess: invalidate }); }
export function useDeleteStoreLogo(slug: string | undefined, accessToken: string | null) { const invalidate = useInvalidate(slug); return useMutation({ mutationFn: () => deleteStoreLogo(slug!, accessToken!), onSuccess: invalidate }); }
