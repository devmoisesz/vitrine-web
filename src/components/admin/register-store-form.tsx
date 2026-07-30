"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterStore } from "@/features/admin/hooks/use-register-store";

const registerStoreSchema = z.object({
  store_name: z.string().trim().min(1, "O nome da loja é obrigatório."),
  store_email: z.string().trim().refine((value) => !value || z.string().email().safeParse(value).success, "Insira um e-mail de loja válido."),
  owner_email: z.string().trim().email("Insira um e-mail de proprietário válido."),
  whatsapp: z.string().transform((value) => value.replace(/\D/g, "")).refine((value) => value.length === 10 || value.length === 11, "O número de WhatsApp deve conter DDD e um número válido."),
});

type RegisterStoreValues = z.input<typeof registerStoreSchema>;

function phoneMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, digits.length === 11 ? 7 : 6)}-${digits.slice(digits.length === 11 ? 7 : 6)}`;
}

export function RegisterStoreForm() {
  const router = useRouter();
  const mutation = useRegisterStore();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<RegisterStoreValues>({ resolver: zodResolver(registerStoreSchema), defaultValues: { store_name: "", store_email: "", owner_email: "", whatsapp: "" } });
  const whatsapp = register("whatsapp");

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      const data = registerStoreSchema.parse(values);
      await mutation.mutateAsync({ ...data, store_name: data.store_name.trim(), store_email: data.store_email.trim(), owner_email: data.owner_email.trim() });
      setSuccess(true);
      window.setTimeout(() => router.replace("/admin"), 700);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Não foi possível cadastrar a loja. Tente novamente.";
      if (/propriet|owner|usuário|usuario|user|conta/i.test(message)) setError("owner_email", { type: "server", message: "Nenhuma conta encontrada com este e-mail. O proprietário precisa se cadastrar antes." });
      else setApiError(message);
    }
  });

  return <form onSubmit={onSubmit} className="max-w-xl space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-7" noValidate>
    {apiError ? <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiError}</div> : null}
    {success ? <div role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Loja cadastrada com sucesso. Redirecionando…</div> : null}
    <Field label="Nome da loja *" error={errors.store_name?.message}><Input {...register("store_name")} autoComplete="organization" /></Field>
    <Field label="E-mail da loja (opcional)" error={errors.store_email?.message}><Input {...register("store_email")} type="email" autoComplete="email" /></Field>
    <Field label="E-mail do proprietário *" error={errors.owner_email?.message}><Input {...register("owner_email")} type="email" autoComplete="email" /><p className="mt-1.5 text-xs text-gray-500">Este e-mail já deve pertencer a uma conta cadastrada na plataforma.</p></Field>
    <Field label="WhatsApp *" error={errors.whatsapp?.message}><Input {...whatsapp} inputMode="numeric" placeholder="(11) 91234-5678" value={undefined} onChange={(event) => { event.target.value = phoneMask(event.target.value); whatsapp.onChange(event); }} /></Field>
    <Button type="submit" className="w-full sm:w-auto" disabled={mutation.isPending || success}>{mutation.isPending ? "Cadastrando..." : "Cadastrar loja"}</Button>
  </form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium">{label}<div className="mt-2">{children}</div>{error ? <p role="alert" className="mt-1.5 text-xs text-red-600">{error}</p> : null}</label>;
}
