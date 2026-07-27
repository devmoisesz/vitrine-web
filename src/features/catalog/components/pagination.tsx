'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

const PAGE_SIZE = 40;

interface PaginationProps {
  currentPage: number;
  /** Quantidade de itens retornados nesta página — usado para o modo degradado */
  itemsInCurrentPage: number;
  /** Só disponível quando o backend expõe X-Total-Count (ver fetch-products.ts) */
  totalCount?: number;
  gridRef: React.RefObject<HTMLElement | null>;
}

export function Pagination({ currentPage, itemsInCurrentPage, totalCount, gridRef }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : undefined;
  const hasNextPage = totalPages ? currentPage < totalPages : itemsInCurrentPage === PAGE_SIZE;
  const hasPreviousPage = currentPage > 1;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/?${params.toString()}`);

    // Rola até o topo do grid, não do topo absoluto da página — mantém o
    // contexto do header/filtros visível.
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Modo completo: sabemos o total de páginas, mostramos os números
  if (totalPages) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <nav data-slot="pagination" aria-label="Paginação" className="flex items-center justify-center gap-2 py-8">
        <PageButton disabled={!hasPreviousPage} onClick={() => goToPage(currentPage - 1)} label="Página anterior">
          «
        </PageButton>

        {pages.map((page) => (
          <PageButton key={page} active={page === currentPage} onClick={() => goToPage(page)} label={`Página ${page}`}>
            {page}
          </PageButton>
        ))}

        <PageButton disabled={!hasNextPage} onClick={() => goToPage(currentPage + 1)} label="Próxima página">
          »
        </PageButton>
      </nav>
    );
  }

  // Modo degradado: sem total de páginas, só anterior/próximo + página atual
  return (
    <nav data-slot="pagination" aria-label="Paginação" className="flex items-center justify-center gap-3 py-8 text-sm">
      <PageButton disabled={!hasPreviousPage} onClick={() => goToPage(currentPage - 1)} label="Página anterior">
        « Anterior
      </PageButton>
      <span className="text-gray-500">Página {currentPage}</span>
      <PageButton disabled={!hasNextPage} onClick={() => goToPage(currentPage + 1)} label="Próxima página">
        Próxima »
      </PageButton>
    </nav>
  );
}

interface PageButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  disabled?: boolean;
}

function PageButton({ children, onClick, label, active, disabled }: PageButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      data-slot="pagination-button"
      data-disabled={disabled ? '' : undefined}
      className={twMerge(
        'flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm',
        active ? 'bg-black text-white' : 'text-black hover:bg-gray-50',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
      )}
    >
      {children}
    </button>
  );
}
