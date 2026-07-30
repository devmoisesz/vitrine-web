import { Minus, Plus } from "lucide-react";

export function QuantitySelector({ value, onChange }: { value: number; onChange: (quantity: number) => void }) {
  return (
    <div className="mt-7">
      <p className="text-sm font-medium">Quantidade</p>
      <div className="mt-3 flex w-fit items-center border border-border">
        <button type="button" aria-label="Diminuir quantidade" disabled={value <= 1} onClick={() => onChange(value - 1)} className="p-2 disabled:opacity-30"><Minus className="size-4" /></button>
        <span className="min-w-10 text-center text-sm">{value}</span>
        <button type="button" aria-label="Aumentar quantidade" onClick={() => onChange(value + 1)} className="p-2"><Plus className="size-4" /></button>
      </div>
    </div>
  );
}
