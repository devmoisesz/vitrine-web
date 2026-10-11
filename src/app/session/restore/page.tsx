"use client";

import { useEffect } from "react";
import { refreshSession } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { getUserRole } from "@/lib/api-client";
import { authHref, loginDestination } from "@/lib/login-destination";

export default function RestoreSessionPage() {
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    let safeDestination = "/";
    try {
      const destination = new URL(params.get("returnTo") || "/", window.location.origin);
      if (destination.origin === window.location.origin &&
        /^\/(admin|painel)(\/|$)/.test(destination.pathname)) {
        safeDestination = destination.pathname + destination.search;
      }
    } catch {
      // Invalid or external return paths must not prevent session restoration.
    }

    void refreshSession().then((restored) => {
      if (!cancelled) window.location.replace(restored
        ? loginDestination(new URLSearchParams({ redirect: safeDestination }).toString(), getUserRole())
        : authHref("/login", safeDestination));
    }).catch((error: unknown) => {
      if (cancelled) return;
      const destination = new URL("/session/unavailable", window.location.origin);
      destination.searchParams.set("returnTo", safeDestination);
      const retryAt = error instanceof ApiError ? error.retryAt : undefined;
      destination.searchParams.set("retryAfter", String(Math.max(5, Math.ceil(((retryAt ?? 0) - Date.now()) / 1000))));
      window.location.replace(destination);
    });
    return () => { cancelled = true; };
  }, []);

  return <p className="p-8 text-center">Restaurando sua sessão…</p>;
}
