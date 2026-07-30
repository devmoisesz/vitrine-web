import { AdminShortcutCard } from "@/components/admin/admin-shortcut-card";
import { RecentStoresTable } from "@/components/admin/recent-stores-table";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header><p className="eyebrow text-gray-500">Administração</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Dashboard</h1></header>
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Atalhos"><AdminShortcutCard href="/admin/lojas/nova">+ Cadastrar loja</AdminShortcutCard><AdminShortcutCard href="/admin/categorias/nova">+ Cadastrar categoria</AdminShortcutCard><AdminShortcutCard href="/admin/categorias/subcategorias/nova">+ Cadastrar subcategoria</AdminShortcutCard></section>
      <RecentStoresTable />
    </div>
  );
}
