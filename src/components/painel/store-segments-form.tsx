"use client";

import { useState } from "react";
import { SegmentChecklist } from "@/components/store/segment-checklist";
import { Button } from "@/components/ui/button";
import { useUpdateStore } from "@/features/painel/hooks/use-update-store";
import type { Segment } from "@/types/segment";

export function StoreSegmentsForm({ segments, slug, accessToken }: { segments: Segment[]; slug: string; accessToken: string }) {
  const [selected, setSelected] = useState(segments.map(segment => segment.id));
  const update = useUpdateStore(slug, accessToken);
  return <form className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 sm:p-7" onSubmit={async event => { event.preventDefault(); try { await update.mutateAsync({ segmentIds: selected }); } catch { /* Exposed below. */ } }}>
    <SegmentChecklist value={selected} onChange={values => { setSelected(values); update.reset(); }} disabled={update.isPending} />
    {update.error && <p role="alert" className="text-sm text-red-700">{update.error.message}</p>}
    {update.isSuccess && <p role="status" className="text-sm text-emerald-700">Segmentos atualizados.</p>}
    <Button type="submit" disabled={update.isPending}>{update.isPending ? "Salvando…" : "Salvar segmentos"}</Button>
  </form>;
}
