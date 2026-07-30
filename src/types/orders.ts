import type { ProductImage } from "@/types/catalog";

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  total: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  price: string;
  quantity: number;
  selectedSize: string | null;
  product: {
    id: string;
    name: string;
    price: string;
    products_images: ProductImage[];
  };
}

export interface OrderDetails extends Order {
  order_items: OrderItem[];
}

export interface OrdersPage {
  data: Order[];
  page: number;
}
