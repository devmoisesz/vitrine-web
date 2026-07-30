import { AdminCategoriesList, CategoryActions } from "@/components/admin/admin-categories-list";

export default function AdminCategoriesPage() {
  return <div className="mx-auto max-w-6xl"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-gray-500">Administração</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Categorias e subcategorias</h1></div><CategoryActions /></div><AdminCategoriesList /></div>;
}
