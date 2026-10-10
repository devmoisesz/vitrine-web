"use client";

import { use } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useStoreSettings } from "@/features/painel/hooks/use-store-settings";
import { StoreSegmentsForm } from "@/components/painel/store-segments-form";
import { Button } from "@/components/ui/button";

export default function EditStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { accessToken, isLoading } = useAuth();
  const settings = useStoreSettings(slug, accessToken);
  if (isLoading || settings.isLoading) return <p role="status">Carregando loja…</p>;
  if (!accessToken || settings.isError || !settings.data) return <div role="alert"><p>Não foi possível carregar a loja.</p><Button className="mt-4" onClick={() => void settings.refetch()}>Tentar novamente</Button></div>;
  return <div className="mx-auto max-w-3xl space-y-6"><Link className="text-sm underline" href="/admin/lojas">Voltar às lojas</Link><h1 className="font-serif text-4xl">Segmentos de {settings.data.name}</h1><StoreSegmentsForm key={slug} segments={settings.data.segments ?? []} slug={slug} accessToken={accessToken} /></div>;
}
