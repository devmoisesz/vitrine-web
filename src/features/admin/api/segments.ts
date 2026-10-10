import { apiClient } from "@/lib/api-client";
import type { Segment } from "@/types/segment";

export function saveSegment(input: { name: string; slug?: string }, id?: string) {
  return apiClient<Segment>(id ? `/segments/${encodeURIComponent(id)}` : "/segments", {
    method: id ? "PUT" : "POST", body: input, authenticated: true, credentials: "include",
  });
}
export function deleteSegment(id: string) {
  return apiClient<void>(`/segments/${encodeURIComponent(id)}`, { method: "DELETE", authenticated: true, credentials: "include" });
}
