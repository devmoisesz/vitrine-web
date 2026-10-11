"use client";

import { useEffect, useState } from "react";

export function SessionRetry({ retryAt, onRetry }: { retryAt?: number; onRetry: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil(((retryAt ?? 0) - now) / 1000));
  return <div role="alert" className="mx-auto max-w-lg space-y-4 p-8 text-center">
    <h1 className="text-2xl font-semibold">Não foi possível verificar sua sessão</h1>
    <p>O servidor está temporariamente indisponível. Sua sessão foi preservada.</p>
    <button type="button" disabled={seconds > 0} onClick={onRetry} className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50">
      {seconds > 0 ? `Tentar novamente em ${seconds}s` : "Tentar novamente"}
    </button>
  </div>;
}
