interface SizeSelectorProps {
  sizes: string[];
  value: string | null;
  onChange: (size: string) => void;
}

export function SizeSelector({ sizes, value, onChange }: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <fieldset className="mt-7">
      <legend className="text-sm font-medium">Tamanho</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button key={size} type="button" onClick={() => onChange(size)} aria-pressed={value === size} className="min-w-10 border border-border px-3 py-2 text-sm transition-colors hover:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">
            {size}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
