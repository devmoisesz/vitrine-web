"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmployeesTable } from "@/components/painel/employees-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useStoreProfile } from "@/features/painel/hooks/use-store-profile";

function isOwner(role: string | undefined) {
  return role === "PROPRIETARIO" || role === "Proprietário";
}

export default function FuncionariosPage() {
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading } = useAuth();
  const profile = useStoreProfile(accessToken);
  const owner = isOwner(profile.data?.user_role);

  useEffect(() => {
    if (!isAuthLoading && !profile.isLoading && profile.data && !owner) router.replace("/painel");
  }, [isAuthLoading, owner, profile.data, profile.isLoading, router]);

  if (isAuthLoading || profile.isLoading) return <div className="mx-auto max-w-6xl py-8"><div className="h-10 w-52 animate-pulse rounded bg-gray-200" /></div>;
  if (!owner) return null;

  const { store_slug: slug } = profile.data ?? {};
  if (!accessToken || !slug) return <div className="mx-auto max-w-6xl rounded-xl border border-red-200 bg-red-50 p-6"><p className="text-sm text-red-700">Não foi possível identificar a loja vinculada à sua conta.</p><Button className="mt-4" variant="secondary" onClick={() => profile.refetch()}>Tentar novamente</Button></div>;

  return <div className="mx-auto max-w-6xl space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow text-gray-500">{profile.data?.store_name ?? "Painel da loja"}</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Funcionários</h1></div></div><EmployeesTable slug={slug} accessToken={accessToken} /></div>;
}
