"use client";

import { useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSegments } from "@/features/store/hooks/use-segments";

export function StoreFilterDialog({ selected, onApply }: { selected: string[]; onApply: (segments: string[]) => void }) {
  const titleId = useId();
  const descriptionId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(selected);
  const segments = useSegments();
  function apply(values: string[]) { onApply(values); setOpen(false); }
  return <Dialog.Root open={open} onOpenChange={value => { if (value) setDraft(selected); setOpen(value); }}>
    <Dialog.Trigger className="inline-flex min-h-11 items-center gap-2 border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"><SlidersHorizontal className="size-4" aria-hidden="true" />Filtrar{selected.length > 0 && <span>({selected.length})</span>}</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
      <Dialog.Popup aria-labelledby={titleId} aria-describedby={descriptionId} className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-border bg-background p-6 text-foreground shadow-xl outline-none">
        <div className="flex items-start justify-between gap-4"><Dialog.Title id={titleId} className="font-display text-2xl font-semibold">Filtrar lojas</Dialog.Title><Dialog.Close aria-label="Fechar filtros" className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded hover:bg-muted"><X className="size-5" /></Dialog.Close></div>
        <Dialog.Description id={descriptionId} className="mt-2 text-sm leading-6 text-muted-foreground">Escolha os tipos de loja que deseja explorar. As lojas podem pertencer a mais de um segmento.</Dialog.Description>
        <div className="my-6 min-h-0 overflow-y-auto">
          {segments.isLoading ? <p role="status">Carregando segmentos…</p> : segments.isError ? <div role="alert"><p>Não foi possível carregar os segmentos.</p><Button className="mt-3" variant="secondary" onClick={() => void segments.refetch()}>Tentar novamente</Button></div>
            : <fieldset><legend className="mb-3 text-sm font-medium">Segmentos</legend>{segments.data?.length ? <div className="space-y-1">{segments.data.map(segment => <label key={segment.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded px-2 py-3 hover:bg-muted"><input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-black" checked={draft.includes(segment.slug)} onChange={e => setDraft(values => e.target.checked ? [...values, segment.slug] : values.filter(slug => slug !== segment.slug))} /><span className="min-w-0 break-words text-sm">{segment.name}</span></label>)}</div> : <p className="text-sm text-muted-foreground">Nenhum segmento cadastrado. Você pode explorar todas as lojas.</p>}</fieldset>}
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-4"><Button variant="ghost" onClick={() => apply([])}>Limpar filtros</Button><Button disabled={segments.isLoading || segments.isError} onClick={() => apply(draft)}>Aplicar filtros</Button></div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
