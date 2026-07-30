import { apiClient } from "@/lib/api-client";
import type { OrdersPage, Order } from "@/types/orders";

export async function fetchOrders(
  page: number,
  accessToken: string,
): Promise<OrdersPage> {
  const data = await apiClient<Order[]>(`/orders?page=${page}`, {
    method: "GET",
    authenticated: true,
    accessToken,
    credentials: "include",
  });

  return { data, page };
}
