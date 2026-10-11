"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SessionRetry } from "@/components/auth/session-retry";

function UnavailableSession() {
  const params = useSearchParams();
  const seconds = Number(params.get("retryAfter") ?? 5);
  const [retryAt] = useState(() => Date.now() + (Number.isFinite(seconds) ? Math.max(1, seconds) : 60) * 1000);
  return <SessionRetry retryAt={retryAt} onRetry={() => {
    let returnTo = "/lojas";
    try {
      const destination = new URL(params.get("returnTo") ?? "/lojas", window.location.origin);
      if (destination.origin === window.location.origin && /^\/(admin|painel)(\/|$)/.test(destination.pathname)) {
        returnTo = destination.pathname + destination.search;
      }
    } catch { /* External and malformed destinations use store discovery. */ }
    window.location.replace(returnTo);
  }} />;
}

export default function UnavailableSessionPage() {
  return <Suspense fallback={<p className="p-8 text-center">Verificando sessão…</p>}><UnavailableSession /></Suspense>;
}
