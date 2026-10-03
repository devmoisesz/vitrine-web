"use client";

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
  return <div><label className="vw-search-label" htmlFor="store-search">Buscar uma loja</label><input id="store-search" type="search" value={input} onChange={e => change(e.target.value)} placeholder="Digite o nome da loja" className="vw-search" /></div>;
}
