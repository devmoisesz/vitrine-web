"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown, LogOut, Search, ShoppingBag, X } from "lucide-react";

import whiteLogo from "../../../img/vitrine-web-white.png";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { logout } from "@/features/auth/api/authenticate";
import { useCartCount } from "@/features/cart/hooks/use-cart-count";
import { useProfile } from "@/features/profile/hooks/use-profile";

function HeaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken, isLoading: isAuthLoading } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(
    Boolean(searchParams.get("name")),
  );

  const [searchValue, setSearchValue] = useState(
    searchParams.get("name") ?? "",
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: cartCount } = useCartCount(
    isAuthenticated ? accessToken : null,
  );
  const { data: profile, isLoading: isProfileLoading } = useProfile(
    isAuthenticated ? accessToken : null,
  );

  const userName = profile?.user_name?.trim() ?? "";
  const firstName = userName.split(/\s+/)[0] || "Usuário";
  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  function handleSearchChange(value: string) {
    setSearchValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("name", value);
      } else {
        params.delete("name");
      }

      params.delete("page");

      const query = params.toString();

      router.push(query ? `/?${query}` : "/");
    }, 400);
  }

  function handleCloseSearch() {
    if (!searchValue) {
      setIsSearchOpen(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-foreground text-background">
      <div className="relative mx-auto flex h-24 max-w-[1400px] items-center px-3 md:h-32 md:px-8">
        <Link
          href="/lojas"
          className="text-sm font-medium transition-opacity hover:opacity-70 md:absolute md:left-8"
        >
          Lojas
        </Link>

        <Link href="/" className="mx-auto transition-opacity hover:opacity-80">
          <Image
            src={whiteLogo}
            alt="Vitrine Web"
            width={220}
            height={220}
            priority
            className="h-12 w-12 object-contain sm:h-16 sm:w-16 md:h-40 md:w-40"
          />
        </Link>

        <div className="flex items-center gap-1.5 md:absolute md:right-8 md:gap-3">
          <div
            className="hidden items-center overflow-hidden border-b transition-all duration-200 md:flex"
            style={{
              width: isSearchOpen ? "14rem" : "0",
              borderColor: isSearchOpen
                ? "var(--color-background)"
                : "transparent",
            }}
          >
            <input
              ref={inputRef}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar produtos"
              aria-label="Buscar produtos"
              className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-background/50"
            />
          </div>

          <button
            type="button"
            aria-label={isSearchOpen ? "Fechar busca" : "Abrir busca"}
            onClick={() => setIsSearchOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
          >
            {isSearchOpen ? (
              <X className="size-5" />
            ) : (
              <Search className="size-5" />
            )}
          </button>

          {isAuthLoading ? (
            <div
              aria-label="Carregando dados da conta"
              className="h-10 w-28 animate-pulse rounded-full bg-background/15"
            />
          ) : isAuthenticated ? (
            <>
              <Menu.Root modal={false}>
                <Menu.Trigger
                  openOnHover
                  delay={100}
                  closeDelay={150}
                  aria-label="Abrir menu da conta"
                  className="flex h-10 items-center gap-2 rounded-full bg-background/10 py-1 pl-1 pr-2 transition-colors hover:bg-background/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-full bg-background text-xs font-bold text-foreground"
                  >
                    {isProfileLoading ? "" : initials || "U"}
                  </span>
                  <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                    {isProfileLoading ? (
                      <span className="block h-3 w-16 animate-pulse rounded bg-background/30" />
                    ) : (
                      <>Olá, {firstName}</>
                    )}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="hidden size-4 sm:block"
                  />
                </Menu.Trigger>

                <Menu.Portal>
                  <Menu.Positioner side="bottom" align="end" sideOffset={8}>
                    <Menu.Popup className="z-50 min-w-52 rounded-xl border border-border bg-surface p-1 shadow-md outline-none">
                      <Menu.Item
                        onClick={() => router.push("/perfil")}
                        className="cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted data-[highlighted]:bg-muted focus-visible:ring-2 focus-visible:ring-foreground/30"
                      >
                        Perfil
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => router.push("/pedidos")}
                        className="cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted data-[highlighted]:bg-muted focus-visible:ring-2 focus-visible:ring-foreground/30"
                      >
                        Meus pedidos
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => router.push("/carrinho")}
                        className="cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted data-[highlighted]:bg-muted focus-visible:ring-2 focus-visible:ring-foreground/30"
                      >
                        Meus carrinhos
                      </Menu.Item>
                      <Menu.Separator className="my-1 h-px bg-border" />
                      <Menu.Item
                        onClick={handleLogout}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 data-[highlighted]:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/30"
                      >
                        <LogOut aria-hidden="true" className="size-4" />
                        Sair
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>

              <Link
                href="/carrinho"
                aria-label="Meus carrinhos"
                className="relative flex size-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
              >
                <ShoppingBag className="size-5" />

                {Boolean(cartCount) && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-background text-[10px] font-medium text-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/cadastro"
                className="whitespace-nowrap rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-opacity hover:opacity-80 sm:px-5 sm:py-2 sm:text-sm"
              >
                Criar Conta
              </Link>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-opacity hover:opacity-80 sm:px-5 sm:py-2 sm:text-sm"
              >
                Entrar
              </Link>
            </>
          )}
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-background/15 px-4 pb-3 pt-2 md:hidden">
          <input
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={handleCloseSearch}
            placeholder="Buscar produtos"
            aria-label="Buscar produtos"
            className="w-full border-b border-background/40 bg-transparent py-2 text-sm outline-none placeholder:text-background/50"
          />
        </div>
      )}
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderContent />
    </Suspense>
  );
}
