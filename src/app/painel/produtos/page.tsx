"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/painel/products-table";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useStoreProfile } from "@/features/painel/hooks/use-store-profile";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "ATIVO", label: "Ativos" },
  { value: "INATIVO", label: "Inativos" },
] as const;

export default function PainelProdutosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const profile = useStoreProfile(accessToken);
  const slug = profile.data?.store_slug;

  const currentStatus = searchParams.get("status") ?? "";
  const currentPage = Number(searchParams.get("page") ?? "1");

  function handleStatusChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1"); // volta pra página 1 ao mudar filtro
    router.push(`/painel/produtos?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-gray-500">
            {profile.data?.store_name ?? "Produtos"}
          </p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Produtos</h1>
        </div>
        <Link href="/painel/produtos/novo">
          <Button>+ Cadastrar produto</Button>
        </Link>
      </div>

      {/* Filtro de status */}
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = currentStatus === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleStatusChange(opt.value)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-500"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Tabela */}
      {slug && accessToken ? (
        <ProductsTable
          slug={slug}
          accessToken={accessToken}
          status={currentStatus || undefined}
          page={currentPage}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      )}
    </div>
  );
}
