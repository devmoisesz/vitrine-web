"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function StoreSearchInput({ value, onSearch }: { value: string; onSearch: (value: string) => void }) {
  const [input, setInput] = useState(value);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (debounce.current) clearTimeout(debounce.current); }, []);
  function change(next: string) {
    setInput(next);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => onSearch(next.trim()), 400);
  }
  return <label className="flex h-13 w-full items-center gap-3 border-b border-foreground/30 bg-white px-1 focus-within:border-foreground"><Search aria-hidden="true" className="size-5 text-muted-foreground" /><input value={input} onChange={(event) => change(event.target.value)} placeholder="Buscar lojas pelo nome" aria-label="Buscar lojas pelo nome" className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" /></label>;
}
