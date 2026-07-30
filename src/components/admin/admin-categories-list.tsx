"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAdminCategories } from "@/features/admin/hooks/use-admin-categories";

export function AdminCategoriesList() {
  const { data, isLoading, isError, refetch } = useAdminCategories();
  if (isLoading) return <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded bg-gray-100" />)}</div>;
  if (isError) return <div className="rounded-xl border border-gray-200 bg-white p-8 text-center"><p className="text-sm text-gray-500">Não foi possível carregar as categorias.</p><Button size="sm" variant="secondary" className="mt-4" onClick={() => refetch()}>Tentar novamente</Button></div>;
  if (!data?.length) return <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Nenhuma categoria cadastrada.</div>;
  return <div className="space-y-3">{data.map((category) => <article key={category.id} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-center justify-between gap-4"><h2 className="text-base font-semibold">{category.name}</h2><span className="text-xs text-gray-500">{category.subcategories.length} subcategoria{category.subcategories.length === 1 ? "" : "s"}</span></div>{category.subcategories.length ? <ul className="mt-4 flex flex-wrap gap-2">{category.subcategories.map((subcategory) => <li key={subcategory.id} className="rounded-full bg-gray-100 px-3 py-1 text-sm">{subcategory.name}</li>)}</ul> : <p className="mt-3 text-sm text-gray-500">Sem subcategorias.</p>}</article>)}</div>;
}

export function CategoryActions() {
  return <div className="flex flex-wrap gap-3"><Link href="/admin/categorias/nova" className="inline-flex h-11 items-center justify-center rounded-lg border border-black bg-black px-4 text-sm font-medium text-white hover:bg-gray-800">+ Cadastrar categoria</Link><Link href="/admin/categorias/subcategorias/nova" className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-black hover:bg-gray-50">+ Cadastrar subcategoria</Link></div>;
}
