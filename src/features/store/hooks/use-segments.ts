import { useQuery } from "@tanstack/react-query";
import { publicCatalog } from "@/lib/public-catalog";
import type { Segment } from "@/types/segment";

export function useSegments() {
  return useQuery({ queryKey: ["segments"], queryFn: async () => (await publicCatalog<Segment[]>("/segments")).data });
}
