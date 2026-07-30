import Link from "next/link";
import { AdminStoresList } from "@/components/admin/admin-stores-list";

export default function AdminStoresPage() {
  return <div className="mx-auto max-w-6xl"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-gray-500">Administração</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Lojas</h1></div><Link href="/admin/lojas/nova" className="inline-flex h-11 items-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-gray-800">+ Cadastrar loja</Link></div><AdminStoresList /></div>;
}
