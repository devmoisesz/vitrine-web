"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterCategory } from "@/features/admin/hooks/use-admin-categories";

const schema = z.object({ name: z.string().trim().min(1, "O nome da categoria é obrigatório.") });
type Values = z.infer<typeof schema>;

export function RegisterCategoryForm() {
  const router = useRouter();
  const mutation = useRegisterCategory();
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "" } });
  const submit = handleSubmit(async ({ name }) => {
    setApiError(null);
    try { await mutation.mutateAsync({ name: name.trim() }); router.replace("/admin/categorias"); }
    catch (error) { setApiError(error instanceof Error ? error.message : "Não foi possível cadastrar a categoria."); }
  });
  return <form onSubmit={submit} className="max-w-xl space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-7" noValidate>{apiError ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiError}</p> : null}<label className="block text-sm font-medium">Nome da categoria *<div className="mt-2"><Input {...register("name")} autoFocus /></div>{errors.name ? <p role="alert" className="mt-1.5 text-xs text-red-600">{errors.name.message}</p> : null}</label><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Cadastrando..." : "Cadastrar categoria"}</Button></form>;
}
