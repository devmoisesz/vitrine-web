"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authHref } from "@/lib/login-destination";

export function AuthSwitchLink({ route, children }: { route: "/login" | "/cadastro"; children: React.ReactNode }) {
  return <Suspense fallback={<Link className="font-bold text-black underline underline-offset-4" href={route}>{children}</Link>}><ReturnLink route={route}>{children}</ReturnLink></Suspense>;
}
function ReturnLink({ route, children }: { route: "/login" | "/cadastro"; children: React.ReactNode }) {
  const params = useSearchParams();
  return <Link className="font-bold text-black underline underline-offset-4" href={authHref(route, params.get("redirect") ?? params.get("next"))}>{children}</Link>;
}
