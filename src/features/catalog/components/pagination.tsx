"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 40;

interface PaginationProps {
  currentPage: number;
  /** Quantidade de itens retornados nesta página — usado para o modo degradado */
  itemsInCurrentPage: number;
  /** Só disponível quando o backend expõe X-Total-Count (ver fetch-products.ts) */
  totalCount?: number;
  gridRef: React.RefObject<HTMLElement | null>;
  /** Rota que receberá o parâmetro `page`. A Home continua sendo o padrão. */
  basePath?: string;
}

export function Pagination({
  currentPage,
  itemsInCurrentPage,
  totalCount,
  gridRef,
  basePath = "/",
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = totalCount ? Math.ceil(totalCount / PAGE_SIZE) : undefined;
  const hasNextPage = totalPages
    ? currentPage < totalPages
    : itemsInCurrentPage === PAGE_SIZE;
  const hasPreviousPage = currentPage > 1;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${basePath}?${params.toString()}`);

    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Modo completo: sabemos o total de páginas, mostramos os números
  if (totalPages) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visiblePages = getVisiblePages(pages, currentPage);

    return (
      <nav
        aria-label="Paginação"
        className="mt-14 flex items-center justify-center gap-1"
      >
        <button
          type="button"
          aria-label="Página anterior"
          disabled={!hasPreviousPage}
          onClick={() => goToPage(currentPage - 1)}
          className="p-2 text-muted-foreground disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>

        {visiblePages.map((value) =>
          typeof value === "number" ? (
            <button
              key={value}
              type="button"
              onClick={() => goToPage(value)}
              aria-current={value === currentPage ? "page" : undefined}
              className={twMerge(
                "flex size-9 items-center justify-center text-sm transition-colors",
                value === currentPage
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value}
            </button>
          ) : (
            <span key={value} className="px-1 text-muted-foreground">
              …
            </span>
          ),
        )}

        <button
          type="button"
          aria-label="Próxima página"
          disabled={!hasNextPage}
          onClick={() => goToPage(currentPage + 1)}
          className="p-2 text-muted-foreground disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    );
  }

  // Modo degradado: sem total de páginas, só anterior/próximo + página atual
  return (
    <nav
      aria-label="Paginação"
      className="mt-14 flex items-center justify-center gap-3 text-sm"
    >
      <button
        type="button"
        aria-label="Página anterior"
        disabled={!hasPreviousPage}
        onClick={() => goToPage(currentPage - 1)}
        className="p-2 text-muted-foreground disabled:opacity-30"
      >
        <ChevronLeft className="size-4" /> Anterior
      </button>

      <span className="text-muted-foreground">Página {currentPage}</span>

      <button
        type="button"
        aria-label="Próxima página"
        disabled={!hasNextPage}
        onClick={() => goToPage(currentPage + 1)}
        className="p-2 text-muted-foreground disabled:opacity-30"
      >
        Próxima <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

function getVisiblePages(
  pages: number[],
  current: number,
): (number | string)[] {
  const total = pages.length;
  if (total <= 7) return pages;

  const result: (number | string)[] = [];
  const alwaysShowFirst = 1;
  const alwaysShowLast = total;

  if (current <= 4) {
    result.push(...pages.slice(0, 5), "…", alwaysShowLast);
  } else if (current >= total - 3) {
    result.push(alwaysShowFirst, "…", ...pages.slice(total - 5));
  } else {
    result.push(
      alwaysShowFirst,
      "…",
      current - 1,
      current,
      current + 1,
      "…",
      alwaysShowLast,
    );
  }

  return result;
}
