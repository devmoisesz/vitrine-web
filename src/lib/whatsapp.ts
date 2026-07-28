import { formatBRL } from "./format";
import type { Address, Cart } from "@/types/catalog";

export function cartSubtotal(cart: Cart) {
  return cart.cart_items.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0,
  );
}

export function cartItemCount(cart: Cart) {
  return cart.cart_items.reduce((total, item) => total + item.quantity, 0);
}

function formatAddress(address: Address) {
  const line = [address.street, address.number, address.complement]
    .filter(Boolean)
    .join(", ");
  return `${line} — ${address.neighborhood}, ${address.city}/${address.state} — CEP ${address.cep}`;
}

export interface WhatsappMessageInput {
  cart: Cart;
  customerName?: string | null;
  address?: Address | null;
  /** Modalidades aceitas pela loja (entrega/pagamento), quando disponíveis. */
  deliveryOptions?: string[];
  paymentOptions?: string[];
}

export function buildWhatsappMessage({
  cart,
  customerName,
  address,
  deliveryOptions,
  paymentOptions,
}: WhatsappMessageInput) {
  const lines: string[] = [];

  lines.push(`Olá, ${cart.store.name}! Gostaria de solicitar este pedido:`);
  lines.push("");

  if (customerName) lines.push(`*Cliente:* ${customerName}`);
  lines.push("");
  lines.push("*Produtos*");

  for (const item of cart.cart_items) {
    const size = item.selectedSize ? ` | Tamanho: ${item.selectedSize}` : "";
    const lineTotal = formatBRL(Number(item.product.price) * item.quantity);
    lines.push(
      `• ${item.product.name}${size} | Qtd: ${item.quantity} — ${lineTotal}`,
    );
  }

  lines.push("");
  lines.push(`*Subtotal:* ${formatBRL(cartSubtotal(cart))}`);

  if (address) {
    lines.push("");
    lines.push("*Endereço de entrega*");
    lines.push(formatAddress(address));
  }

  if (deliveryOptions?.length) {
    lines.push("");
    lines.push(`*Entrega:* ${deliveryOptions.join(", ")}`);
  }

  if (paymentOptions?.length) {
    lines.push(`*Pagamento:* ${paymentOptions.join(", ")}`);
  }

  lines.push("");
  lines.push("Enviado pela Vitrine Web.");

  return lines.join("\n");
}

export function buildWhatsappUrl(
  phone: string | null | undefined,
  message: string,
) {
  const digits = (phone ?? "").replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return digits
    ? `https://wa.me/${digits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}
