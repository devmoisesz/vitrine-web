import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "../api/store";

export function useEmployees(slug: string | undefined, accessToken: string | null) {
  return useQuery({
    queryKey: ["painel", "employees", slug],
    queryFn: () => getEmployees(slug!, accessToken!),
    enabled: Boolean(slug && accessToken),
  });
}
