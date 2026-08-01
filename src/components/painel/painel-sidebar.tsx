"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, PanelLeftClose, X } from "lucide-react";
import { useState } from "react";
import { logout } from "@/features/auth/api/authenticate";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { isOwnerRole } from "@/lib/roles";
import { useStoreProfile } from "@/features/painel/hooks/use-store-profile";

const links = [
  { href: "/painel", label: "Dashboard", exact: true },
  { href: "/painel/produtos", label: "Produtos" },
  { href: "/painel/pedidos", label: "Pedidos" },
  { href: "/painel/funcionarios", label: "Funcionários", ownerOnly: true },
  { href: "/painel/loja", label: "Dados da loja", ownerOnly: true },
];

export function PainelSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { accessToken } = useAuth();
  const { data: profile } = useStoreProfile(accessToken);
  const [open, setOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  async function handleLogout() {
    setIsLeaving(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <>
      <button
        aria-label="Abrir menu do painel"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg border border-gray-200 bg-white p-2.5 lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      {open ? (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-gray-200 bg-white p-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : ""}`}
      >
        <div className="flex items-start justify-between border-b border-gray-200 pb-6">
          <Link
            href="/painel"
            className="font-serif text-2xl leading-tight"
            onClick={() => setOpen(false)}
          >
            {profile?.store_name ?? "Sua loja"}
            <span className="block font-sans text-xs font-medium text-gray-500">
              Painel do lojista
            </span>
          </Link>
          <button
            aria-label="Fechar menu"
            className="rounded p-1 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
          <PanelLeftClose className="mt-1 hidden size-5 text-gray-500 lg:block" />
        </div>
        <nav className="mt-6 space-y-1" aria-label="Navegação do painel">
          {links
            .filter(
              (link) => !link.ownerOnly || isOwnerRole(profile?.user_role),
            )
            .map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50 hover:text-black"}`}
                >
                  {link.label}
                </Link>
              );
            })}
        </nav>
        <button
          onClick={handleLogout}
          disabled={isLeaving}
          className="mt-auto flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black disabled:opacity-50"
        >
          <LogOut className="size-4" />
          {isLeaving ? "Saindo..." : "Sair"}
        </button>
      </aside>
    </>
  );
}
