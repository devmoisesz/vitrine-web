"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { ImageCropperDialog } from "@/components/painel/image-cropper-dialog";
import { useChangeStoreLogo } from "@/features/painel/hooks/use-change-store-logo";
import { useDeleteStoreLogo } from "@/features/painel/hooks/use-delete-store-logo";
import { useUploadStoreLogo } from "@/features/painel/hooks/use-upload-store-logo";

const accepted = ["image/png", "image/jpeg", "image/webp"];
const maxSize = 2 * 1024 * 1024; // 2MB

export function StoreLogoManager({
  logoUrl,
  slug,
  accessToken,
}: {
  logoUrl: string | null;
  slug: string;
  accessToken: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const upload = useUploadStoreLogo(slug, accessToken);
  const change = useChangeStoreLogo(slug, accessToken);
  const remove = useDeleteStoreLogo(slug, accessToken);
  const pending = upload.isPending || change.isPending || remove.isPending;

  function showSuccess(message: string) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(null), 3500);
  }

  /** Ao selecionar arquivo: valida tipo/tamanho ANTES de abrir o cropper */
  function selectFile(file?: File) {
    if (!file) return;
    if (!accepted.includes(file.type)) {
      setError("Formato não aceito. Use PNG, JPG ou WebP.");
      return;
    }
    if (file.size > maxSize) {
      setError("A imagem deve ter no máximo 2MB.");
      return;
    }
    setError(null);
    setSuccess(null);
    setCropFile(file);
  }

  /** Ao confirmar o corte: dispara o upload (POST ou PATCH) */
  async function uploadCropped(croppedFile: File) {
    setCropFile(null);
    try {
      // Se o estado local diz que não há logo, tenta POST. Caso o backend
      // responda 409 (conflito — já existe uma logo), retorna ao endpoint de
      // troca (PATCH). Isso cobre divergências entre o cache local e o servidor.
      try {
        await (logoUrl ? change : upload).mutateAsync(croppedFile);
      } catch (requestError) {
        if (
          !logoUrl &&
          requestError instanceof ApiError &&
          requestError.status === 409
        ) {
          await change.mutateAsync(croppedFile);
        } else {
          throw requestError;
        }
      }
      showSuccess("Logo salva com sucesso.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível enviar a logo.",
      );
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function deleteLogo() {
    if (!window.confirm("Remover a logo atual da loja?")) return;
    setError(null);
    setSuccess(null);
    try {
      await remove.mutateAsync();
      showSuccess("Logo removida com sucesso.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível remover a logo.",
      );
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
      <h2 className="font-serif text-2xl">Logo</h2>
      <p className="mt-1 text-sm text-gray-500">
        PNG, JPG ou WebP, com no máximo 2MB. Use uma imagem quadrada (1:1).
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="Logo atual da loja"
            width={96}
            height={96}
            className="size-24 rounded-lg border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-500">
            Sem logo
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => selectFile(event.target.files?.[0])}
          disabled={pending}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={pending}>
          {pending && !remove.isPending
            ? "Enviando..."
            : logoUrl
              ? "Trocar"
              : "Enviar logo"}
        </Button>
        {logoUrl ? (
          <Button
            variant="secondary"
            onClick={() => void deleteLogo()}
            disabled={pending}
          >
            {remove.isPending ? "Removendo..." : "Remover"}
          </Button>
        ) : null}
      </div>
      {success ? (
        <p className="mt-3 text-sm text-emerald-700">{success}</p>
      ) : null}
      {error ? <p className="mt-3 text-sm font-medium">{error}</p> : null}

      <ImageCropperDialog
        file={cropFile as File}
        aspectRatio={1}
        isOpen={Boolean(cropFile)}
        onConfirm={(croppedFile) => void uploadCropped(croppedFile)}
        onCancel={() => {
          setCropFile(null);
          if (inputRef.current) inputRef.current.value = "";
        }}
        isUploading={upload.isPending || change.isPending}
      />
    </section>
  );
}
