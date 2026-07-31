"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StoreGeneralForm } from "@/components/painel/store-general-form";
import { PaymentMethodsChecklist } from "@/components/painel/payment-methods-checklist";
import { DeliveryMethodsChecklist } from "@/components/painel/delivery-methods-checklist";
import { StoreLogoManager } from "@/components/painel/store-logo-manager";
import { StoreAddressSection } from "@/components/painel/store-address-section";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useStoreProfile } from "@/features/painel/hooks/use-store-profile";
import { useStoreSettings } from "@/features/painel/hooks/use-store-settings";

function isOwner(role: string | undefined) { return role === "PROPRIETARIO" || role === "Proprietário"; }
function Skeleton() { return <div className="mx-auto max-w-5xl space-y-5">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-48 animate-pulse rounded-xl bg-gray-200" />)}</div>; }

export default function LojaPage() {
  const router = useRouter(); const { accessToken, isLoading: authLoading } = useAuth(); const profile = useStoreProfile(accessToken); const owner = isOwner(profile.data?.user_role); const slug = profile.data?.store_slug; const settings = useStoreSettings(owner ? slug : undefined, accessToken);
  useEffect(() => { if (!authLoading && !profile.isLoading && profile.data && !owner) router.replace("/painel"); }, [authLoading, owner, profile.data, profile.isLoading, router]);
  if (authLoading || profile.isLoading || (owner && settings.isLoading)) return <Skeleton />;
  if (!owner) return null;
  if (!accessToken || !slug || settings.isError || !settings.data) return <div className="mx-auto max-w-5xl rounded-xl border border-red-200 bg-red-50 p-6"><p className="text-sm text-red-700">Não foi possível carregar os dados da loja.</p><Button variant="secondary" className="mt-4" onClick={() => void settings.refetch()}>Tentar novamente</Button></div>;
  const data = settings.data;
  return <div className="mx-auto max-w-5xl space-y-6"><header><p className="eyebrow text-gray-500">{profile.data?.store_name ?? "Painel da loja"}</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Dados da loja</h1></header><StoreGeneralForm settings={data} slug={slug} accessToken={accessToken} /><div className="grid gap-6 lg:grid-cols-2"><PaymentMethodsChecklist values={data.payment_methods ?? []} slug={slug} accessToken={accessToken} /><DeliveryMethodsChecklist values={data.delivery_methods ?? []} slug={slug} accessToken={accessToken} /></div><StoreLogoManager logoUrl={data.logo_url} slug={slug} accessToken={accessToken} /><StoreAddressSection address={data.address} slug={slug} accessToken={accessToken} /></div>;
}
