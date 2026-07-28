"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, User, X } from "lucide-react";

import whiteLogo from "../../../img/vitrine-web-white.png";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCartCount } from "@/features/cart/hooks/use-cart-count";

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAuth();

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

  return (
    <header className="sticky top-0 z-40 bg-foreground text-background">
      <div className="relative mx-auto flex h-24 max-w-[1400px] items-center px-4 md:h-32 md:px-8">
        <Link href="/" className="mx-auto transition-opacity hover:opacity-80">
          <Image
            src={whiteLogo}
            alt="Vitrine Web"
            width={220}
            height={56}
            priority
            className="h-28 w-auto object-contain md:h-40"
          />
        </Link>

        <div className="absolute right-4 flex items-center gap-2 md:right-8 md:gap-3">
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

          {isAuthenticated ? (
            <>
              <Link
                href="/perfil"
                aria-label="Meu perfil"
                className="flex size-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
              >
                <User className="size-5" />
              </Link>

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
            <Link
              href="/login"
              className="rounded-full bg-background px-5 py-2 text-sm font-medium text-foreground transition-opacity hover:opacity-80"
            >
              Entrar
            </Link>
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
