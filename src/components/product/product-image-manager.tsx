"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductImageCard } from "@/components/product/product-image-card";
import { ProductImageUploader } from "@/components/product/product-image-uploader";
import {
  uploadProductImage,
  changeProductImage,
  setMainProductImage,
  deleteProductImage,
  type ProductImageItem,
} from "@/features/painel/api/store";

interface ProductImageManagerProps {
  slug: string;
  productId: string;
  accessToken: string;
  /** Chamado ao clicar em "Salvar" — usado para sair da tela */
  onSave?: () => void;
}

/**
 * Orquestra o estado da gestão de imagens do produto.
 * - Lista imagens (ProductImageItem[])
 * - Upload de nova imagem (POST)
 * - Trocar arquivo de imagem existente (PATCH)
 * - Marcar imagem como principal (PATCH set-main)
 * - Remover imagem (DELETE)
 * - Limite de 5 imagens
 * - Bloqueia remoção da última imagem
 */
export function ProductImageManager({
  slug,
  productId,
  accessToken,
  onSave,
}: ProductImageManagerProps) {
  const queryClient = useQueryClient();
  const queryKey = ["painel", "product-images", slug, productId];

  // Estado local das imagens (atualizado otimisticamente)
  const [images, setImages] = useState<ProductImageItem[]>([]);

  // Carrega imagens (não temos endpoint GET, mas o POST/PATCH retornam dados;
  // após remover, re-buscamos se necessário)
  // Na prática, o estado inicial é vazio e vamos populando com os retornos.
  // Se precisar recarregar, use refetchImages.

  const [isUploading, setIsUploading] = useState(false);
  const [settingMainId, setSettingMainId] = useState<string | null>(null);
  const [changingFileId, setChangingFileId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canUpload = images.length < 5;
  const hasExistingImages = images.length > 0;

  // ─── Upload ────────────────────────────────────────────────────────────
  const handleUpload = useCallback(
    async (file: File, isMain: boolean) => {
      if (!canUpload) return;
      setIsUploading(true);
      setError(null);

      try {
        const newImage = await uploadProductImage(
          slug,
          productId,
          file,
          isMain || undefined,
          accessToken,
        );
        setImages((prev) => [...prev, newImage]);
        toast.success("Imagem enviada com sucesso!");
      } catch {
        setError("Erro ao enviar imagem. Tente novamente.");
      } finally {
        setIsUploading(false);
      }
    },
    [slug, productId, accessToken, canUpload],
  );

  // ─── Trocar arquivo ────────────────────────────────────────────────────
  const handleChangeFile = useCallback(
    async (imageId: string, file: File) => {
      setChangingFileId(imageId);
      setError(null);

      try {
        const updatedImage = await changeProductImage(
          slug,
          productId,
          imageId,
          file,
          accessToken,
        );
        setImages((prev) =>
          prev.map((img) => (img.id === imageId ? updatedImage : img)),
        );
      } catch {
        setError("Erro ao trocar imagem. Tente novamente.");
      } finally {
        setChangingFileId(null);
      }
    },
    [slug, productId, accessToken],
  );

  // ─── Marcar como principal ─────────────────────────────────────────────
  const handleSetMain = useCallback(
    async (imageId: string) => {
      setSettingMainId(imageId);
      setError(null);

      try {
        await setMainProductImage(slug, productId, imageId, accessToken);
        // Atualiza localmente: desmarca todas, marca a selecionada
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_main: img.id === imageId,
          })),
        );
      } catch {
        setError("Erro ao definir imagem principal. Tente novamente.");
      } finally {
        setSettingMainId(null);
      }
    },
    [slug, productId, accessToken],
  );

  // ─── Remover ───────────────────────────────────────────────────────────
  const handleRemove = useCallback(
    async (imageId: string) => {
      setRemovingId(imageId);
      setError(null);

      try {
        await deleteProductImage(slug, productId, imageId, accessToken);
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      } catch {
        setError("Erro ao remover imagem. Tente novamente.");
      } finally {
        setRemovingId(null);
      }
    },
    [slug, productId, accessToken],
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <p className="eyebrow text-gray-500">Gestão de imagens</p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
          Imagens do produto
        </h1>
        <p className="mt-1 text-sm text-gray-500">{images.length}/5 imagens</p>
      </div>

      {/* Grid de imagens existentes */}
      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <ProductImageCard
              key={image.id}
              image={image}
              isOnlyOne={images.length === 1}
              onSetMain={handleSetMain}
              onChangeFile={handleChangeFile}
              onRemove={handleRemove}
              isSettingMain={settingMainId === image.id}
              isChangingFile={changingFileId === image.id}
              isRemoving={removingId === image.id}
            />
          ))}
        </div>
      )}

      {/* Uploader */}
      {canUpload ? (
        <ProductImageUploader
          hasExistingImages={hasExistingImages}
          isUploading={isUploading}
          onUpload={handleUpload}
        />
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-8 text-center">
          <p className="text-sm text-gray-500">
            Limite de 5 imagens atingido. Remova uma imagem para adicionar
            outra.
          </p>
        </div>
      )}

      {/* Botão salvar / concluir */}
      <div className="flex items-center justify-end border-t border-gray-200 pt-6">
        <Button
          variant="primary"
          onClick={() => onSave?.()}
          disabled={images.length === 0 || isUploading}
          title={
            images.length === 0
              ? "Envie ao menos 1 imagem antes de salvar."
              : undefined
          }
        >
          Salvar
        </Button>
      </div>

      {/* Erro global */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </section>
  );
}
