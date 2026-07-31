"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

/**
 * Input de tags em formato de chips.
 * Limite: máximo 10 tags, cada uma até 30 caracteres.
 */
export function TagsInput({ tags, onChange }: TagsInputProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addTag(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (tags.length >= MAX_TAGS) {
      setError(`Máximo de ${MAX_TAGS} tags.`);
      return;
    }

    if (trimmed.length > MAX_TAG_LENGTH) {
      setError(`Cada tag pode ter no máximo ${MAX_TAG_LENGTH} caracteres.`);
      return;
    }

    if (tags.includes(trimmed)) {
      setError("Tag já adicionada.");
      return;
    }

    onChange([...tags, trimmed]);
    setInput("");
    setError(null);
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
    setError(null);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-500">
        Tags <span className="text-gray-400">(opcional)</span>
      </label>
      <div className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-[border-color] duration-200 focus-within:border-black">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-500"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="rounded-full p-0.5 hover:bg-gray-200"
              aria-label={`Remover tag ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (input.trim()) addTag(input);
          }}
          placeholder={
            tags.length < MAX_TAGS
              ? "Digite e pressione Enter..."
              : "Limite atingido"
          }
          disabled={tags.length >= MAX_TAGS}
          className="min-w-[100px] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <p className="mt-1 text-xs text-gray-400">
        {tags.length}/{MAX_TAGS} tags
      </p>
    </div>
  );
}
