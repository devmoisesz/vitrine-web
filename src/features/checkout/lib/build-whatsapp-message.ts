import { formatPrice } from "@/lib/format-price";
import type { Address } from "@/features/profile/api/profile";

const paymentLabels: Record<string, string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  CARTAO_ENTREGA: "Cartão na entrega",
  CARTAO_ONLINE: "Cartão online",
};

const deliveryLabels: Record<string, string> = {
  RETIRADA_LOJA: "Retirada na loja",
  ENTREGA_PROPRIA: "Entrega própria",
  CORREIOS: "Correios",
  MOTOBOY: "Motoboy",
};

export function translatePaymentMethod(method: string) {
  return paymentLabels[method] ?? method;
}

export function translateDeliveryMethod(method: string) {
  return deliveryLabels[method] ?? method;
}

interface WhatsAppMessageInput {
  customerName: string;
  items: {
    name: string;
    quantity: number;
    selectedSize: string | null;
    price: string;
  }[];
  address: Address | null;
  paymentMethods: string[];
  deliveryMethods: string[];
}

export function buildWhatsAppMessage({
  customerName,
  items,
  address,
  paymentMethods,
  deliveryMethods,
}: WhatsAppMessageInput) {
  const itemsList = items
    .map((item) => {
      const sizeLabel = item.selectedSize ? ` (Tamanho: ${item.selectedSize})` : "";
      return `- ${item.quantity}x ${item.name}${sizeLabel} - ${formatPrice(item.price)}`;
    })
    .join("\n");

  const total = formatPrice(
    items.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0),
  );

  const addressBlock = address
    ? `\n\nEndereço para entrega:\n${address.street}, ${address.number} - ${address.neighborhood}\n${address.city}/${address.state} - ${address.cep}`
    : "";

  const paymentLabel = paymentMethods.map(translatePaymentMethod).join(", ");
  const deliveryLabel = deliveryMethods.map(translateDeliveryMethod).join(", ");

  return `Olá! Meu nome é ${customerName} e gostaria de fazer o seguinte pedido:\n\n${itemsList}\n\nTotal: ${total}${addressBlock}\n\nFormas de pagamento aceitas: ${paymentLabel}\nFormas de entrega: ${deliveryLabel}`;
}
