"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StoreSettings } from "@/features/painel/api/store";
import { useUpdateStore } from "@/features/painel/hooks/use-update-store";

const schema = z.object({ name: z.string().trim().min(1, "Informe o nome da loja."), email: z.string().trim().email("Informe um e-mail válido."), whatsapp: z.string().transform((value) => value.replace(/\D/g, "")).refine((value) => value.length === 10 || value.length === 11, "Informe um WhatsApp com DDD válido."), description: z.string().trim().min(1, "Informe uma descrição.") });
type Values = z.input<typeof schema>;
function phoneMask(value: string) { const digits = value.replace(/\D/g, "").slice(0, 11); if (digits.length <= 2) return digits ? `(${digits}` : ""; if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`; return `(${digits.slice(0, 2)}) ${digits.slice(2, digits.length === 11 ? 7 : 6)}-${digits.slice(digits.length === 11 ? 7 : 6)}`; }

export function StoreGeneralForm({ settings, slug, accessToken }: { settings: StoreSettings; slug: string; accessToken: string }) {
  const update = useUpdateStore(slug, accessToken); const [success, setSuccess] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: settings.name, email: settings.email ?? "", whatsapp: phoneMask(settings.whatsapp), description: settings.description } });
  useEffect(() => form.reset({ name: settings.name, email: settings.email ?? "", whatsapp: phoneMask(settings.whatsapp), description: settings.description }), [settings, form]);
  const whatsapp = form.register("whatsapp");
  async function submit(values: Values) { try { const parsed = schema.parse(values); await update.mutateAsync({ newName: parsed.name, newEmail: parsed.email, newWhatsapp: parsed.whatsapp, newDescription: parsed.description }); form.reset(values); setSuccess(true); window.setTimeout(() => setSuccess(false), 3500); } catch (error) { form.setError("root", { message: error instanceof Error ? error.message : "Não foi possível salvar os dados." }); } }
  return <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7"><h2 className="font-serif text-2xl">Dados gerais</h2><form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}><Field label="Nome" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field><Field label="E-mail" error={form.formState.errors.email?.message}><Input type="email" {...form.register("email")} /></Field><Field label="WhatsApp" error={form.formState.errors.whatsapp?.message}><Input {...whatsapp} inputMode="numeric" placeholder="(11) 91234-5678" onChange={(event) => { event.target.value = phoneMask(event.target.value); whatsapp.onChange(event); }} /></Field><Field label="Descrição" error={form.formState.errors.description?.message} className="md:col-span-2"><textarea className="min-h-28 w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black focus:ring-offset-2" {...form.register("description")} /></Field>{form.formState.errors.root ? <p className="text-sm text-red-600 md:col-span-2">{form.formState.errors.root.message}</p> : null}{success ? <p className="text-sm text-emerald-700 md:col-span-2">Dados gerais atualizados.</p> : null}<div className="md:col-span-2"><Button type="submit" disabled={update.isPending}>{update.isPending ? "Salvando..." : "Salvar dados"}</Button></div></form></section>;
}
function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) { return <label className={`grid gap-2 text-sm font-medium ${className ?? ""}`}>{label}{children}{error ? <span className="text-xs text-red-600">{error}</span> : null}</label>; }
