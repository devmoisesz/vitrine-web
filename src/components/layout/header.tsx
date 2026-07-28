"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, X } from "lucide-react";
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
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  function handleSearchChange(value: string) {
    setSearchValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("name", value);
      } else {
        params.delete("name");
      }
      params.delete("page");

      router.push(`/?${params.toString()}`);
    }, 400);
  }

  function handleCloseSearch() {
    if (!searchValue) {
      setIsSearchOpen(false);
    }
  }

  return (
    <header
      data-slot="header"
      className="border-b border-white/10 bg-[#050505] px-4 py-4 text-white shadow-sm md:px-8"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="w-16 shrink-0 md:w-24" />

        <Link
          href="/"
          data-slot="header-logo"
          className="flex flex-1 items-center justify-center"
        >
          <Image
            src={whiteLogo}
            alt="Vitrine Web"
            width={220}
            height={56}
            priority
            className="h-14 w-auto object-contain sm:h-16 md:h-20"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div data-slot="header-search" className="flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <Search className="size-4 text-white/80" aria-hidden />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onBlur={handleCloseSearch}
                  placeholder="Buscar produtos"
                  className="w-32 bg-transparent py-1 text-sm text-white outline-none placeholder:text-white/60 sm:w-48"
                />
                <button
                  type="button"
                  aria-label="Fechar busca"
                  onClick={() => {
                    setSearchValue("");
                    handleSearchChange("");
                    setIsSearchOpen(false);
                  }}
                >
                  <X className="size-4 text-white/80 transition hover:text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                aria-label="Buscar"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20"
              >
                <Search className="size-4" />
              </button>
            )}
          </div>

          {isAuthenticated ? (
            <Link
              href="/carrinho"
              aria-label="Meus carrinhos"
              className="relative rounded-full border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20"
            >
              <ShoppingBag className="size-4" />
              {Boolean(cartCount) && (
                <span
                  data-slot="cart-badge"
                  className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-black"
                >
                  {cartCount}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/20 bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-gray-100"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
