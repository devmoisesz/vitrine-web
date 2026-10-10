"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/painel/confirm-dialog";
import { useSegments } from "@/features/store/hooks/use-segments";
import { useAdminSegments } from "@/features/admin/hooks/use-admin-segments";
import type { Segment } from "@/types/segment";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome.").max(100),
  slug: z.string().trim().max(100).regex(/^(?:[a-z0-9]+(?:-[a-z0-9]+)*)?$/, "Use letras minúsculas, números e hífens."),
});
type Values = z.infer<typeof schema>;

export function AdminSegments() {
  const segments = useSegments();
  const { save, remove } = useAdminSegments();
  const [editing, setEditing] = useState<Segment | null>(null);
  const [deleting, setDeleting] = useState<Segment | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", slug: "" } });
  function reset() { setEditing(null); form.reset({ name: "", slug: "" }); save.reset(); }
  async function submit(values: Values) {
    setNotice(null);
    try {
      await save.mutateAsync({ ...values, slug: values.slug || undefined, id: editing?.id });
      reset();
      setNotice("Segmento salvo.");
    } catch { /* Mutation exposes the API's validation/conflict message. */ }
  }
  async function confirmDelete() {
    if (!deleting || remove.isPending) return;
    try {
      await remove.mutateAsync(deleting.id);
      if (editing?.id === deleting.id) reset();
      setNotice("Segmento excluído.");
    } catch { /* Keep the API's association-blocking message visible. */ }
    setDeleting(null);
  }
  return <div className="space-y-6">
    <form onSubmit={form.handleSubmit(submit)} className="max-w-2xl space-y-4 rounded-xl border border-border bg-white p-5 sm:p-7">
      <h2 className="font-serif text-2xl">{editing ? "Editar segmento" : "Cadastrar segmento"}</h2>
      <label className="grid gap-2 text-sm font-medium">Nome<Input {...form.register("name")} maxLength={100} />{form.formState.errors.name && <span role="alert" className="text-red-700">{form.formState.errors.name.message}</span>}</label>
      <label className="grid gap-2 text-sm font-medium">Slug<Input {...form.register("slug")} maxLength={100} placeholder="Gerado a partir do nome se deixado em branco" />{form.formState.errors.slug && <span role="alert" className="text-red-700">{form.formState.errors.slug.message}</span>}</label>
      {save.error && <p role="alert" className="text-sm text-red-700">{save.error.message}</p>}
      <div className="flex flex-wrap gap-3"><Button disabled={save.isPending} type="submit">{save.isPending ? "Salvando…" : editing ? "Salvar alterações" : "Cadastrar segmento"}</Button>{editing && <Button type="button" variant="secondary" disabled={save.isPending} onClick={reset}>Cancelar edição</Button>}</div>
    </form>
    {notice && <p role="status" className="text-sm">{notice}</p>}
    {remove.error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{remove.error.message}</p>}
    {segments.isLoading ? <p role="status">Carregando segmentos…</p> : segments.isError ? <div role="alert"><p>Não foi possível carregar os segmentos.</p><Button className="mt-3" onClick={() => void segments.refetch()}>Tentar novamente</Button></div>
      : !segments.data?.length ? <p className="rounded-xl border border-border bg-white p-6 text-sm text-muted-foreground">Nenhum segmento cadastrado.</p>
      : <ul className="space-y-3">{segments.data.map(segment => <li key={segment.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-white p-5"><div className="min-w-0 break-words"><h2 className="font-semibold">{segment.name}</h2><p className="text-sm text-muted-foreground">{segment.slug}</p></div><div className="flex gap-2"><Button variant="secondary" disabled={save.isPending || remove.isPending} aria-label={`Editar segmento ${segment.name}`} onClick={() => { setEditing(segment); form.reset(segment); save.reset(); form.setFocus("name"); }}>Editar</Button><Button variant="ghost" disabled={save.isPending || remove.isPending} aria-label={`Excluir segmento ${segment.name}`} onClick={() => { remove.reset(); setDeleting(segment); }}>Excluir</Button></div></li>)}</ul>}
    <ConfirmDialog open={Boolean(deleting)} title="Excluir segmento" confirmLabel={remove.isPending ? "Excluindo…" : "Excluir segmento"} onConfirm={() => void confirmDelete()} onCancel={() => { if (!remove.isPending) setDeleting(null); }} destructive>Excluir {deleting?.name}? Segmentos associados a lojas não podem ser excluídos.</ConfirmDialog>
  </div>;
}
