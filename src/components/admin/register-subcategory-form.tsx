"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminCategories, useRegisterSubcategory } from "@/features/admin/hooks/use-admin-categories";

const schema = z.object({ categorySlug: z.string().min(1, "Selecione uma categoria."), name: z.string().trim().min(1, "O nome da subcategoria é obrigatório.") });
type Values = z.infer<typeof schema>;

export function RegisterSubcategoryForm() {
  const router = useRouter();
  const categories = useAdminCategories();
  const mutation = useRegisterSubcategory();
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { categorySlug: "", name: "" } });
  const submit = handleSubmit(async (values) => {
    setApiError(null);
    try { await mutation.mutateAsync({ ...values, name: values.name.trim() }); router.replace("/admin/categorias"); }
    catch (error) { setApiError(error instanceof Error ? error.message : "Não foi possível cadastrar a subcategoria."); }
  });
  return <form onSubmit={submit} className="max-w-xl space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-7" noValidate>
    {apiError ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiError}</p> : null}
    <label className="block text-sm font-medium">Categoria *<select className="mt-2 h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black focus:ring-offset-2" disabled={categories.isLoading || !categories.data?.length} {...register("categorySlug")}><option value="">{categories.isLoading ? "Carregando categorias..." : "Selecione uma categoria"}</option>{categories.data?.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select>{errors.categorySlug ? <p role="alert" className="mt-1.5 text-xs text-red-600">{errors.categorySlug.message}</p> : null}</label>
    <label className="block text-sm font-medium">Nome da subcategoria *<div className="mt-2"><Input {...register("name")} autoFocus /></div>{errors.name ? <p role="alert" className="mt-1.5 text-xs text-red-600">{errors.name.message}</p> : null}</label>
    <Button type="submit" disabled={mutation.isPending || categories.isLoading}>{mutation.isPending ? "Cadastrando..." : "Cadastrar subcategoria"}</Button>
  </form>;
}
