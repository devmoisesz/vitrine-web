import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveSegment, deleteSegment } from "../api/segments";

export function useAdminSegments() {
  const client = useQueryClient();
  const invalidate = () => Promise.all([
    client.invalidateQueries({ queryKey: ["segments"] }),
    client.invalidateQueries({ queryKey: ["stores-search"] }),
    client.invalidateQueries({ queryKey: ["store-profile"] }),
    client.invalidateQueries({ queryKey: ["painel", "store-settings"] }),
  ]);
  return {
    save: useMutation({ mutationFn: ({ id, ...data }: { id?: string; name: string }) => saveSegment(data, id), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: deleteSegment, onSuccess: invalidate }),
  };
}
