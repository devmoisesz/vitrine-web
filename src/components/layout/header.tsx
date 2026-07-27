'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search, ShoppingBag, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCartCount } from '@/features/cart/hooks/use-cart-count';

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchParams.get('name')));
  const [searchValue, setSearchValue] = useState(searchParams.get('name') ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Só busca a contagem do carrinho se o usuário estiver autenticado —
  // nunca chamar /carts para um visitante.
  const { data: cartCount } = useCartCount(isAuthenticated ? accessToken : null);

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  function handleSearchChange(value: string) {
    setSearchValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set('name', value);
      } else {
        params.delete('name');
      }
      params.delete('page'); // nova busca sempre volta pra página 1

      router.push(`/?${params.toString()}`);
    }, 400);
  }

  function handleCloseSearch() {
    // Só recolhe o campo visualmente se não houver texto — busca ativa
    // não deve ser perdida por um fechamento acidental.
    if (!searchValue) {
      setIsSearchOpen(false);
    }
  }

  return (
    <header
      data-slot="header"
      className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-4 md:px-8"
    >
      <Link href="/" data-slot="header-logo" className="shrink-0">
        <Image
          src="/vitrine-web-black.png"
          alt="Vitrine Web"
          width={160}
          height={40}
          priority
          className="h-8 w-auto md:h-9"
        />
      </Link>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div data-slot="header-search" className="flex items-center">
          {isSearchOpen ? (
            <div className="flex items-center gap-2 border-b border-black">
              <Search className="size-4 text-gray-500" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onBlur={handleCloseSearch}
                placeholder="Buscar produtos"
                className="w-40 bg-transparent py-1 text-sm outline-none placeholder:text-gray-500 md:w-64"
              />
              <button
                type="button"
                aria-label="Fechar busca"
                onClick={() => {
                  setSearchValue('');
                  handleSearchChange('');
                  setIsSearchOpen(false);
                }}
              >
                <X className="size-4 text-gray-500 hover:text-black" />
              </button>
            </div>
          ) : (
            <button type="button" aria-label="Buscar" onClick={() => setIsSearchOpen(true)}>
              <Search className="size-5 hover:text-gray-500" />
            </button>
          )}
        </div>

        {isAuthenticated ? (
          <Link href="/carrinho" aria-label="Meus carrinhos" className="relative">
            <ShoppingBag className="size-5 hover:text-gray-500" />
            {Boolean(cartCount) && (
              <span
                data-slot="cart-badge"
                className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-black text-[10px] text-white"
              >
                {cartCount}
              </span>
            )}
          </Link>
        ) : (
          <Link href="/login" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
            Entrar ou cadastrar
          </Link>
        )}
      </div>
    </header>
  );
}
