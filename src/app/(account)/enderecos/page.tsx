"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddressFormDialog } from "@/components/address/address-form-dialog";
import { AddressList } from "@/components/address/address-list";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import type { Address } from "@/features/address/api/address";
import { useAddresses } from "@/features/address/hooks/use-addresses";
import { useAuth } from "@/features/auth/hooks/use-auth";

function AddressSkeleton() { return <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 animate-pulse border border-border bg-muted" />)}</div>; }

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const addresses = useAddresses(accessToken);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  useEffect(() => { if (!authLoading && !isAuthenticated) router.replace("/login?next=/enderecos"); }, [authLoading, isAuthenticated, router]);
  useEffect(() => { if (!successMessage) return; const timeout = window.setTimeout(() => setSuccessMessage(""), 3000); return () => window.clearTimeout(timeout); }, [successMessage]);
  const openAdd = () => { setSelectedAddress(null); setDialogOpen(true); };
  const openEdit = (address: Address) => { setSelectedAddress(address); setDialogOpen(true); };
  if (authLoading || (isAuthenticated && addresses.isLoading)) return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12"><AddressSkeleton /></main></div>;
  if (!isAuthenticated || !accessToken) return null;
  if (addresses.isError) return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12"><div className="border border-dashed border-border p-8 text-center"><h1 className="font-display text-2xl font-semibold">Não foi possível carregar seus endereços</h1><p className="mt-2 text-sm text-muted-foreground">Tente novamente em instantes.</p><Button className="mt-6" onClick={() => void addresses.refetch()}>Tentar novamente</Button></div></main></div>;
  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12"><p className="eyebrow text-muted-foreground">Sua conta</p><h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Meus Endereços</h1><p className="mt-2 text-sm text-muted-foreground">Gerencie os endereços usados nas suas compras.</p>{successMessage && <p role="status" className="mt-6 border border-border bg-muted px-4 py-3 text-sm">{successMessage}</p>}<div className="mt-8"><AddressList addresses={addresses.data ?? []} onAdd={openAdd} onEdit={openEdit} /></div></main><AddressFormDialog open={dialogOpen} onOpenChange={setDialogOpen} address={selectedAddress} accessToken={accessToken} onSuccess={setSuccessMessage} /></div>;
}
