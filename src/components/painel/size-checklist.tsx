"use client";

import { twMerge } from "tailwind-merge";

/** Lista fixa de tamanhos aceitos pelo backend (ALLOWED_SIZES) */
export const ALLOWED_SIZES = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "XGG",
  "EG",
  "EGG",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "U",
  "ÚNICO",
] as const;

interface SizeChecklistProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

/**
 * Checkboxes/chips selecionáveis para a lista fixa ALLOWED_SIZES.
 * Modo "chips" visual: cada tamanho aparece como um badge clicável.
 */
export function SizeChecklist({ selected, onChange }: SizeChecklistProps) {
  function toggle(size: string) {
    if (selected.includes(size)) {
      onChange(selected.filter((s) => s !== size));
    } else {
      onChange([...selected, size]);
    }
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-gray-500">
        Tamanhos <span className="text-gray-400">(opcional)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {ALLOWED_SIZES.map((size) => {
          const isActive = selected.includes(size);
          return (
            <button
              key={size}
              type="button"
              role="checkbox"
              aria-checked={isActive}
              onClick={() => toggle(size)}
              className={twMerge(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-500",
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
