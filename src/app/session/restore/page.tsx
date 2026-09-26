"use client";

import { useEffect } from "react";
import { refreshSession } from "@/lib/api-client";

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
      if (!cancelled) window.location.replace(restored ? safeDestination : "/login");
    });
    return () => { cancelled = true; };
  }, []);

  return <p className="p-8 text-center">Restaurando sua sessão…</p>;
}
