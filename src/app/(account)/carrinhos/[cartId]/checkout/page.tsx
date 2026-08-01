"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AddressSelector } from "@/components/checkout/address-selector";
import { CheckoutItemsSummary } from "@/components/checkout/checkout-items-summary";
import { WhatsAppMessageEditor } from "@/components/checkout/whatsapp-message-editor";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { listCarts } from "@/features/cart/api/cart";
import { useCreateOrder } from "@/features/checkout/hooks/use-create-order";
import { buildWhatsAppMessage } from "@/features/checkout/lib/build-whatsapp-message";
import { useAddresses } from "@/features/profile/hooks/use-addresses";
import { useProfile } from "@/features/profile/hooks/use-profile";

function CheckoutSkeleton() {
  return <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12"><div className="h-7 w-64 animate-pulse bg-muted" /><div className="mt-10 h-48 animate-pulse bg-muted" /><div className="mt-6 h-36 animate-pulse bg-muted" /></main>;
}

export default function CheckoutPage() {
  const { cartId } = useParams<{ cartId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const carts = useQuery({ queryKey: ["carts"], queryFn: () => listCarts(accessToken!), enabled: Boolean(accessToken) });
  const profile = useProfile(accessToken);
  const addresses = useAddresses(accessToken);
  const createOrder = useCreateOrder(accessToken);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [hasEditedMessage, setHasEditedMessage] = useState(false);
  const cart = carts.data?.find((item) => item.id === cartId);
  const addressList = useMemo(() => addresses.data ?? [], [addresses.data]);
  const effectiveAddressId = selectedAddressId ?? addressList[0]?.id ?? null;
  const selectedAddress = addressList.find((item) => item.id === effectiveAddressId) ?? null;
  const generatedMessage = useMemo(() => {
    if (!cart || !profile.data) return "";
    // TODO: payment_methods e delivery_methods dependem de serem incluídos pela API em GET /carts.
    return buildWhatsAppMessage({ customerName: profile.data.user_name, items: cart.cart_items.map((item) => ({ name: item.product.name, quantity: item.quantity, selectedSize: item.selectedSize, price: item.product.price })), address: selectedAddress, paymentMethods: cart.store.payment_methods ?? [], deliveryMethods: cart.store.delivery_methods ?? [] });
  }, [cart, profile.data, selectedAddress]);

  useEffect(() => { if (!authLoading && !isAuthenticated) router.replace(`/login?next=/carrinhos/${cartId}/checkout`); }, [authLoading, cartId, isAuthenticated, router]);
  async function handleSubmit() {
    if (!cart) return;
    if (!cart.store.whatsapp) { toast.error("Esta loja não possui um WhatsApp disponível para pedidos."); return; }
    try {
      await createOrder.mutateAsync(cart.id);
      window.open(`https://wa.me/${cart.store.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(hasEditedMessage ? message : generatedMessage)}`, "_blank", "noopener,noreferrer");
      await queryClient.invalidateQueries({ queryKey: ["carts"] });
      await queryClient.invalidateQueries({ queryKey: ["carts-count"] });
      toast.success("Pedido registrado. Abrimos o WhatsApp da loja para você.");
      router.push("/pedidos");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível registrar o pedido. Tente novamente."); }
  }

  if (authLoading || carts.isLoading || profile.isLoading || addresses.isLoading) return <div className="min-h-screen bg-background"><Header /><CheckoutSkeleton /></div>;
  if (!isAuthenticated || !accessToken) return null;
  if (carts.isError || profile.isError || addresses.isError) return <div className="min-h-screen bg-background"><Header /><main className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-24 text-center md:px-8"><h1 className="font-display text-2xl font-semibold">Não foi possível preparar seu pedido</h1><p className="text-sm text-muted-foreground">Tente carregar o checkout novamente.</p><Button variant="secondary" onClick={() => { void carts.refetch(); void profile.refetch(); void addresses.refetch(); }}>Tentar novamente</Button></main></div>;
  if (!cart) return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-3xl px-4 py-12 text-center md:px-8"><h1 className="font-display text-2xl font-semibold">Carrinho não encontrado</h1><p className="mt-2 text-sm text-muted-foreground">Ele pode já ter sido finalizado em outra aba.</p><Button className="mt-6" onClick={() => router.push("/carrinho")}>Voltar para meus carrinhos</Button></main></div>;

  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12"><Link href="/carrinho" className="text-sm text-muted-foreground hover:text-foreground">← Voltar para meus carrinhos</Link><p className="eyebrow mt-8 text-muted-foreground">{cart.store.name}</p><h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Finalizar pedido</h1><p className="mt-2 text-sm text-muted-foreground">Revise os itens e envie sua solicitação diretamente para a loja.</p><div className="mt-10 flex flex-col gap-10 border border-border p-5 md:p-7"><CheckoutItemsSummary items={cart.cart_items} /><AddressSelector addresses={addressList} selectedAddressId={effectiveAddressId} onSelect={(addressId) => { setSelectedAddressId(addressId); setHasEditedMessage(false); }} /><WhatsAppMessageEditor message={hasEditedMessage ? message : generatedMessage} onMessageChange={(nextMessage) => { setMessage(nextMessage); setHasEditedMessage(true); }} onSubmit={() => void handleSubmit()} isSubmitting={createOrder.isPending} /></div></main></div>;
}
