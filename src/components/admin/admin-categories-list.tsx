"use client";

import Link from "next/link";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminCategories, useUpdateCategory, useUpdateSubcategory } from "@/features/admin/hooks/use-admin-categories";

type Editing = { type: "category" | "subcategory"; id: string; categorySlug: string; value: string } | null;

export function AdminCategoriesList() {
  const { data, isLoading, isError, refetch } = useAdminCategories();
  const updateCategory = useUpdateCategory();
  const updateSubcategory = useUpdateSubcategory();
  const [editing, setEditing] = useState<Editing>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  async function save() {
    if (!editing) return;
    const name = editing.value.trim();
    if (!name) return;
    setApiError(null);
    try {
      if (editing.type === "category") await updateCategory.mutateAsync({ slug: editing.categorySlug, name });
      else await updateSubcategory.mutateAsync({ categorySlug: editing.categorySlug, id: editing.id, name });
      setEditing(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Não foi possível salvar a alteração.");
    }
  }

  const saving = updateCategory.isPending || updateSubcategory.isPending;
  if (isLoading) return <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded bg-gray-100" />)}</div>;
  if (isError) return <div className="rounded-xl border border-gray-200 bg-white p-8 text-center"><p className="text-sm text-gray-500">Não foi possível carregar as categorias.</p><Button size="sm" variant="secondary" className="mt-4" onClick={() => refetch()}>Tentar novamente</Button></div>;
  if (!data?.length) return <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Nenhuma categoria cadastrada.</div>;

  return <div className="space-y-3">{apiError ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiError}</p> : null}{data.map((category) => <article key={category.id} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex items-center justify-between gap-4">{editing?.type === "category" && editing.id === category.id ? <EditName value={editing.value} onChange={(value) => setEditing({ ...editing, value })} onSave={save} onCancel={() => setEditing(null)} saving={saving} /> : <><h2 className="text-base font-semibold">{category.name}</h2><button type="button" aria-label={`Editar categoria ${category.name}`} className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-black" onClick={() => setEditing({ type: "category", id: category.id, categorySlug: category.slug, value: category.name })}><Pencil className="size-4" /></button></>}<span className="text-xs text-gray-500">{category.subcategories.length} subcategoria{category.subcategories.length === 1 ? "" : "s"}</span></div>{category.subcategories.length ? <ul className="mt-4 flex flex-wrap gap-2">{category.subcategories.map((subcategory) => <li key={subcategory.id} className="flex min-h-8 items-center gap-1 rounded-full bg-gray-100 py-1 pl-3 pr-1 text-sm">{editing?.type === "subcategory" && editing.id === subcategory.id ? <EditName compact value={editing.value} onChange={(value) => setEditing({ ...editing, value })} onSave={save} onCancel={() => setEditing(null)} saving={saving} /> : <><span>{subcategory.name}</span><button type="button" aria-label={`Editar subcategoria ${subcategory.name}`} className="rounded-full p-1 text-gray-500 hover:bg-white hover:text-black" onClick={() => setEditing({ type: "subcategory", id: subcategory.id, categorySlug: category.slug, value: subcategory.name })}><Pencil className="size-3.5" /></button></>}</li>)}</ul> : <p className="mt-3 text-sm text-gray-500">Sem subcategorias.</p>}</article>)}</div>;
}

function EditName({ value, onChange, onSave, onCancel, saving, compact = false }: { value: string; onChange: (value: string) => void; onSave: () => void; onCancel: () => void; saving: boolean; compact?: boolean }) {
  return <div className={`flex items-center gap-1 ${compact ? "w-48" : "w-full max-w-sm"}`}><Input className="h-9" value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onSave(); } if (event.key === "Escape") onCancel(); }} autoFocus /><button type="button" aria-label="Salvar" disabled={saving || !value.trim()} onClick={onSave} className="rounded p-1.5 text-green-700 hover:bg-green-100 disabled:opacity-50"><Check className="size-4" /></button><button type="button" aria-label="Cancelar" disabled={saving} onClick={onCancel} className="rounded p-1.5 text-gray-500 hover:bg-gray-200"><X className="size-4" /></button></div>;
}

export function CategoryActions() {
  return <div className="flex flex-wrap gap-3"><Link href="/admin/categorias/nova" className="inline-flex h-11 items-center justify-center rounded-lg border border-black bg-black px-4 text-sm font-medium text-white hover:bg-gray-800">+ Cadastrar categoria</Link><Link href="/admin/categorias/subcategorias/nova" className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-black hover:bg-gray-50">+ Cadastrar subcategoria</Link></div>;
}
