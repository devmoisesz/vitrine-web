"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MoreVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductStatusBadge } from "@/components/painel/product-status-badge";
import { ConfirmDialog } from "@/components/painel/confirm-dialog";
import { formatPrice } from "@/lib/format-price";
import { getMainImage } from "@/types/catalog";
import { useManageProducts } from "@/features/painel/hooks/use-manage-products";
import { useDeleteProduct } from "@/features/painel/hooks/use-delete-product";
import { useToggleProductStatus } from "@/features/painel/hooks/use-toggle-product-status";
import { Pagination } from "@/features/catalog/components/pagination";
import { useRef } from "react";
import type { ManageProduct } from "@/features/painel/api/store";

interface ProductsTableProps {
  slug: string;
  accessToken: string;
  status?: string;
  page: number;
}

export function ProductsTable({
  slug,
  accessToken,
  status,
  page,
}: ProductsTableProps) {
  const router = useRouter();
  const tableRef = useRef<HTMLElement | null>(null);
  const { data, isLoading, isError, refetch } = useManageProducts(
    slug,
    accessToken,
    {
      status,
      page,
    },
  );
  const deleteMutation = useDeleteProduct(slug, accessToken);
  const toggleStatusMutation = useToggleProductStatus(slug, accessToken);

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function handleToggleStatus(product: ManageProduct) {
    const newStatus = product.status === "ATIVO" ? "INATIVO" : "ATIVO";
    setTogglingId(product.id);
    toggleStatusMutation.mutate(
      { productId: product.id, status: newStatus },
      { onSettled: () => setTogglingId(null) },
    );
  }

  function handleDelete(productId: string) {
    setDeleteConfirm(null);
    deleteMutation.mutate(productId);
  }

  // Estados
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-gray-500">
          Não foi possível carregar os produtos.
        </p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 border-b border-gray-100 px-5 py-4"
          >
            <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-gray-500">
          Nenhum produto cadastrado ainda.
        </p>
        <Link href="/painel/produtos/novo">
          <Button variant="primary" size="sm">
            Cadastrar produto
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        title="Remover produto"
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      >
        Tem certeza que deseja remover este produto? Esta ação não pode ser
        desfeita.
      </ConfirmDialog>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Imagem</th>
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Preço</th>
              <th className="px-5 py-3 font-medium">Estoque</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product) => {
              const mainImage = getMainImage(product);
              return (
                <tr key={product.id} className="border-t border-gray-200">
                  {/* Imagem */}
                  <td className="px-5 py-4">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="size-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="size-10 rounded-lg bg-gray-100" />
                    )}
                  </td>
                  {/* Nome */}
                  <td className="px-5 py-4 font-medium text-black">
                    {product.name}
                  </td>
                  {/* Preço */}
                  <td className="px-5 py-4 text-gray-500">
                    {formatPrice(product.price)}
                  </td>
                  {/* Estoque */}
                  <td className="px-5 py-4 text-gray-500">{product.stock}</td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <ProductStatusBadge status={product.status} />
                  </td>
                  {/* Ações */}
                  <td className="relative px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        setMenuOpen(menuOpen === product.id ? null : product.id)
                      }
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-50"
                      aria-label="Abrir menu de ações"
                    >
                      <MoreVertical className="size-4" />
                    </button>

                    {menuOpen === product.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-5 top-12 z-20 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                          <Link
                            href={`/painel/produtos/${product.id}/editar`}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setMenuOpen(null)}
                          >
                            Editar
                          </Link>
                          <button
                            type="button"
                            disabled={togglingId === product.id}
                            onClick={() => {
                              setMenuOpen(null);
                              handleToggleStatus(product);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            {togglingId === product.id && (
                              <Loader2 className="size-3.5 animate-spin" />
                            )}
                            {product.status === "ATIVO"
                              ? "Desativar"
                              : "Ativar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpen(null);
                              setDeleteConfirm(product.id);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Remover
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <Pagination
        currentPage={page}
        itemsInCurrentPage={data.length}
        gridRef={tableRef as React.RefObject<HTMLElement | null>}
        basePath="/painel/produtos"
      />
    </>
  );
}
