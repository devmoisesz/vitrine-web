"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function HomeEntry({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/catalogo");
  }, [isLoading, isAuthenticated, router]);

  // Render the same neutral state on the server and during session restoration.
  // An authenticated visitor never sees the commercial landing flash.
  if (isLoading || isAuthenticated) {
    return <main className="flex min-h-screen items-center justify-center bg-background text-foreground" role="status">Carregando…</main>;
  }
  return children;
}
