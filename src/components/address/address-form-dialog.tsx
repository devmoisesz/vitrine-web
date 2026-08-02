"use client";

import { Dialog } from "@base-ui/react/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Address } from "@/features/address/api/address";
import { useSaveAddress } from "@/features/address/hooks/use-save-address";

const schema = z.object({
  label: z.string().trim().min(1, "Informe uma identificação."),
  cep: z.string().min(8, "Informe um CEP válido."),
  state: z.string().trim().min(2, "Informe o estado."),
  city: z.string().trim().min(1, "Informe a cidade."),
  neighborhood: z.string().trim().min(1, "Informe o bairro."),
  street: z.string().trim().min(1, "Informe a rua."),
  number: z.string().trim().min(1, "Informe o número."),
  complement: z.string(),
});
type Values = z.infer<typeof schema>;
const empty: Values = { label: "", cep: "", state: "", city: "", neighborhood: "", street: "", number: "", complement: "" };
const formatCep = (value: string) => value.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export function AddressFormDialog({ open, onOpenChange, address, accessToken, onSuccess }: {
  open: boolean; onOpenChange: (open: boolean) => void; address: Address | null; accessToken: string; onSuccess: (message: string) => void;
}) {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: empty });
  const save = useSaveAddress(accessToken);
  useEffect(() => { if (open) form.reset(address ? { ...address, complement: address.complement ?? "" } : empty); }, [open, address, form]);

  async function lookupCep(value: string) {
    const cep = value.replace(/\D/g, "");
    if (cep.length !== 8) return;
    form.clearErrors("cep");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error("CEP lookup failed.");
      const result = (await response.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
      if (result.erro) throw new Error("CEP not found.");
      form.setValue("street", result.logradouro ?? "", { shouldDirty: true }); form.setValue("neighborhood", result.bairro ?? "", { shouldDirty: true }); form.setValue("city", result.localidade ?? "", { shouldDirty: true }); form.setValue("state", result.uf ?? "", { shouldDirty: true });
    } catch (error) { form.setError("cep", { message: error instanceof Error ? error.message : "Não foi possível consultar o CEP." }); }
  }
  async function submit(values: Values) {
    try { await save.mutateAsync({ ...values, cep: values.cep.replace(/\D/g, ""), addressId: address?.id }); onOpenChange(false); onSuccess(address ? "Endereço atualizado." : "Endereço adicionado."); }
    catch (error) { form.setError("root", { message: error instanceof Error ? error.message : "Não foi possível salvar o endereço." }); }
  }
  const field = (name: keyof Values, label: string, extra?: React.ComponentProps<typeof Input>) => (
    <label className="grid gap-1.5 text-sm font-medium">{label}<Input {...form.register(name)} {...extra} aria-invalid={Boolean(form.formState.errors[name])} />{form.formState.errors[name] && <span className="text-xs text-destructive">{form.formState.errors[name]?.message}</span>}</label>
  );
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" /><Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4"><Dialog.Popup className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-background p-5 shadow-xl md:p-7"><div className="flex items-start justify-between gap-4"><div><Dialog.Title className="font-display text-2xl font-semibold">{address ? "Editar endereço" : "Adicionar endereço"}</Dialog.Title><Dialog.Description className="mt-1 text-sm text-muted-foreground">Informe os dados do seu endereço.</Dialog.Description></div><Dialog.Close render={<Button variant="ghost" size="sm" aria-label="Fechar" />}><X /></Dialog.Close></div><form onSubmit={form.handleSubmit(submit)} className="mt-6 grid gap-4 md:grid-cols-2">{field("label", "Identificação", { placeholder: "Casa, Trabalho…", className: "md:col-span-2" })}{field("cep", "CEP", { inputMode: "numeric", placeholder: "00000-000", onChange: (event) => { const value = formatCep(event.target.value); form.setValue("cep", value, { shouldValidate: true }); void lookupCep(value); } })}<p className="self-end pb-3 text-xs text-muted-foreground">Preencha o CEP para buscar o endereço.</p>{field("street", "Rua", { className: "md:col-span-2" })}{field("number", "Número")}{field("complement", "Complemento (opcional)")}{field("neighborhood", "Bairro")}{field("city", "Cidade")}{field("state", "Estado", { maxLength: 2, className: "uppercase" })}{form.formState.errors.root && <p className="text-sm text-destructive md:col-span-2">{form.formState.errors.root.message}</p>}<div className="mt-2 flex justify-end gap-3 md:col-span-2"><Dialog.Close render={<Button type="button" variant="secondary" />}>Cancelar</Dialog.Close><Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando…" : "Salvar endereço"}</Button></div></form></Dialog.Popup></Dialog.Viewport></Dialog.Portal></Dialog.Root>;
}
