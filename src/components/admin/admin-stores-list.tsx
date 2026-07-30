"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAdminStores, useUpdateStoreStatus } from "@/features/admin/hooks/use-admin-stores";

export function AdminStoresList() {
  const { data, isLoading, isError, refetch } = useAdminStores();
  const updateStatus = useUpdateStoreStatus();
  return <section className="rounded-xl border border-gray-200 bg-white">
    {isLoading ? <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded bg-gray-100" />)}</div> : null}
    {isError ? <Feedback message="Não foi possível carregar as lojas." retry={() => refetch()} /> : null}
    {!isLoading && !isError && data?.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">Nenhuma loja cadastrada.</p> : null}
    {!isLoading && !isError && data && data.length > 0 ? <div className="overflow-x-auto"><table className="w-full min-w-200 text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3">Loja</th><th className="px-5 py-3">E-mail</th><th className="px-5 py-3">WhatsApp</th><th className="px-5 py-3">Criada em</th><th className="px-5 py-3">Ativa</th></tr></thead><tbody>{data.map((store) => <tr className="border-t border-gray-200" key={store.id}><td className="px-5 py-4 font-medium">{store.slug ? <Link className="underline-offset-4 hover:underline" href={`/loja/${store.slug}`}>{store.name}</Link> : store.name}</td><td className="px-5 py-4 text-gray-500">{store.email ?? "—"}</td><td className="px-5 py-4 text-gray-500">{store.whatsapp ?? "—"}</td><td className="px-5 py-4 text-gray-500">{store.createdAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(store.createdAt)) : "—"}</td><td className="px-5 py-4"><button type="button" role="switch" aria-checked={store.active} aria-label={`${store.active ? "Desativar" : "Ativar"} ${store.name}`} disabled={!store.slug || updateStatus.isPending} onClick={() => updateStatus.mutate({ slug: store.slug, active: !store.active })} className={`relative h-6 w-11 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${store.active ? "border-green-600 bg-green-500" : "border-gray-300 bg-white"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${store.active ? "translate-x-5" : "translate-x-0.5"}`} /></button></td></tr>)}</tbody></table></div> : null}
  </section>;
}

function Feedback({ message, retry }: { message: string; retry: () => void }) {
  return <div className="p-8 text-center"><p className="text-sm text-gray-500">{message}</p><Button size="sm" variant="secondary" className="mt-4" onClick={retry}>Tentar novamente</Button></div>;
}
