import type { ReactNode } from "react";

export function MetricCard({ label, children }: { label: string; children: ReactNode }) {
  return <article className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-3 font-serif text-4xl">{children}</p></article>;
}
