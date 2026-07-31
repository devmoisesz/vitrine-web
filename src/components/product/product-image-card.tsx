"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Star, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/painel/confirm-dialog";
import type { ProductImageItem } from "@/features/painel/api/store";

interface ProductImageCardProps {
  image: ProductImageItem;
  isOnlyOne: boolean;
  onSetMain: (imageId: string) => void;
  onChangeFile: (imageId: string, file: File) => void;
  onRemove: (imageId: string) => void;
  isSettingMain: boolean;
  isChangingFile: boolean;
  isRemoving: boolean;
}

export function ProductImageCard({
  image,
  isOnlyOne,
  onSetMain,
  onChangeFile,
  onRemove,
  isSettingMain,
  isChangingFile,
  isRemoving,
}: ProductImageCardProps) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const fileInputId = `change-file-${image.id}`;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onChangeFile(image.id, file);
    }
    e.target.value = "";
  }

  return (
    <>
      <ConfirmDialog
        open={confirmRemove}
        title="Remover esta imagem?"
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => {
          setConfirmRemove(false);
          onRemove(image.id);
        }}
        onCancel={() => setConfirmRemove(false)}
      >
        Esta ação não pode ser desfeita.
      </ConfirmDialog>

      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Thumbnail */}
        <div className="aspect-square overflow-hidden bg-gray-50">
          <Image
            src={image.image_url}
            alt="Imagem do produto"
            width={300}
            height={300}
            className="size-full object-cover"
          />
        </div>

        {/* Badge "Principal" */}
        {image.is_main && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/90 px-2 py-0.5 text-xs font-medium text-black backdrop-blur-sm">
            <Star className="size-3 fill-black" />
            Principal
          </span>
        )}

        {/* Ações */}
        <div className="space-y-1.5 border-t border-gray-200 p-3">
          {/* Marcar como principal (só se não for principal) */}
          {!image.is_main && (
            <button
              type="button"
              disabled={isSettingMain}
              onClick={() => onSetMain(image.id)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              {isSettingMain ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Star className="size-3.5" />
              )}
              Marcar como principal
            </button>
          )}

          {/* Trocar arquivo */}
          <label
            htmlFor={fileInputId}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 ${
              isChangingFile ? "opacity-50" : ""
            }`}
          >
            {isChangingFile ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Trocar
          </label>
          <input
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isChangingFile}
          />

          {/* Remover (desabilitado se for a única) */}
          <button
            type="button"
            disabled={isOnlyOne || isRemoving}
            onClick={() => setConfirmRemove(true)}
            title={
              isOnlyOne ? "O produto precisa de ao menos 1 imagem." : undefined
            }
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRemoving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Remover
          </button>
        </div>
      </div>
    </>
  );
}
