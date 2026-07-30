"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRecentStores } from "@/features/admin/hooks/use-recent-stores";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

export function RecentStoresTable() {
  const { data, isLoading, isError, refetch } = useRecentStores();

  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="font-serif text-2xl">Últimas lojas cadastradas</h2>
        <Link href="/admin/lojas" className="text-sm font-medium underline underline-offset-4">Ver todas</Link>
      </div>
      {isLoading ? <TableSkeleton /> : null}
      {isError ? (
        <div className="px-5 py-10 text-center"><p className="text-sm text-gray-500">Não foi possível carregar as lojas.</p><Button variant="secondary" size="sm" className="mt-4" onClick={() => refetch()}>Tentar novamente</Button></div>
      ) : null}
      {!isLoading && !isError && data?.length === 0 ? <p className="px-5 py-10 text-center text-sm text-gray-500">Nenhuma loja cadastrada.</p> : null}
      {!isLoading && !isError && data && data.length > 0 ? (
        <div className="overflow-x-auto"><table className="w-full min-w-150 text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3 font-medium">Nome</th><th className="px-5 py-3 font-medium">E-mail de contato</th><th className="px-5 py-3 font-medium">Criada em</th></tr></thead><tbody>{data.map((store) => <tr key={store.id} className="border-t border-gray-200"><td className="px-5 py-4 font-medium">{store.name}</td><td className="px-5 py-4 text-gray-500">{store.email ?? "—"}</td><td className="px-5 py-4 text-gray-500">{formatDate(store.createdAt)}</td></tr>)}</tbody></table></div>
      ) : null}
    </section>
  );
}

function TableSkeleton() {
  return <div className="space-y-px p-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="grid grid-cols-3 gap-8 border-b border-gray-100 py-4"><div className="h-4 animate-pulse rounded bg-gray-200" /><div className="h-4 animate-pulse rounded bg-gray-200" /><div className="h-4 animate-pulse rounded bg-gray-200" /></div>)}</div>;
}
