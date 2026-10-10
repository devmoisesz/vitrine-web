"use client";

import { useSegments } from "@/features/store/hooks/use-segments";
import { Button } from "@/components/ui/button";

export function SegmentChecklist({ value, onChange, disabled }: { value: string[]; onChange: (ids: string[]) => void; disabled?: boolean }) {
  const segments = useSegments();
  return <fieldset disabled={disabled} className="min-w-0 space-y-3">
    <legend className="text-sm font-medium">Segmentos da loja</legend>
    <p className="text-sm text-muted-foreground">Selecione os tipos de loja. Você pode escolher mais de um ou deixar sem segmento.</p>
    {segments.isLoading ? <p role="status" className="text-sm">Carregando segmentos…</p>
      : segments.isError ? <div role="alert"><p className="text-sm">Não foi possível carregar os segmentos.</p><Button type="button" variant="secondary" className="mt-2" onClick={() => void segments.refetch()}>Tentar novamente</Button></div>
      : segments.data?.length ? <div className="grid gap-2 sm:grid-cols-2">{segments.data.map(segment => <label key={segment.id} className="flex min-h-11 items-start gap-3 rounded-lg border border-border p-3 text-sm"><input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-black" checked={value.includes(segment.id)} onChange={e => onChange(e.target.checked ? [...value, segment.id] : value.filter(id => id !== segment.id))} /><span className="min-w-0 break-words">{segment.name}</span></label>)}</div>
      : <p className="text-sm text-muted-foreground">Nenhum segmento cadastrado.</p>}
  </fieldset>;
}
