import { apiClient } from "@/lib/api-client";
import type { OrderDetails } from "@/types/orders";

export function fetchOrder(orderId: string, accessToken: string) {
  return apiClient<OrderDetails>(`/orders/${orderId}`, {
    method: "GET",
    authenticated: true,
    accessToken,
    credentials: "include",
  });
}
