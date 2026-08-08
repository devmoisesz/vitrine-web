"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { useChangeStoreBanner } from "@/features/painel/hooks/use-change-store-banner";
import { useDeleteStoreBanner } from "@/features/painel/hooks/use-delete-store-banner";
import { useUploadStoreBanner } from "@/features/painel/hooks/use-upload-store-banner";

const accepted = ["image/png", "image/jpeg", "image/webp"];
const maxSize = 5 * 1024 * 1024;

export function StoreBannerManager({
  bannerUrl,
  slug,
  accessToken,
}: {
  bannerUrl: string | null;
  slug: string;
  accessToken: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const upload = useUploadStoreBanner(slug, accessToken);
  const change = useChangeStoreBanner(slug, accessToken);
  const remove = useDeleteStoreBanner(slug, accessToken);
  const pending = upload.isPending || change.isPending || remove.isPending;

  function showSuccess(message: string) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(null), 3500);
  }

  async function selectFile(file?: File) {
    if (!file) return;
    if (!accepted.includes(file.type)) {
      setError("Formato não aceito. Use PNG, JPG ou WebP.");
      return;
    }
    if (file.size > maxSize) {
      setError("O banner deve ter no máximo 5MB.");
      return;
    }
    setError(null);
    setSuccess(null);
    // Preview local imediato enquanto o upload é processado
    setPreview(URL.createObjectURL(file));
    try {
      // Se o estado local diz que não há banner, tenta POST. Caso o backend
      // responda 409 (conflito — já existe um banner), retorna ao endpoint de
      // troca (PATCH). Isso cobre divergências entre o cache local e o servidor.
      try {
        await (bannerUrl ? change : upload).mutateAsync(file);
      } catch (requestError) {
        if (
          !bannerUrl &&
          requestError instanceof ApiError &&
          requestError.status === 409
        ) {
          await change.mutateAsync(file);
        } else {
          throw requestError;
        }
      }
      showSuccess("Banner salvo com sucesso.");
    } catch (requestError) {
      setPreview(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível enviar o banner.",
      );
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function deleteBanner() {
    if (!window.confirm("Remover o banner atual da loja?")) return;
    setError(null);
    setSuccess(null);
    try {
      await remove.mutateAsync();
      showSuccess("Banner removido com sucesso.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível remover o banner.",
      );
    }
  }

  const displayUrl = preview ?? bannerUrl;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
      <h2 className="font-serif text-2xl">Banner</h2>
      <p className="mt-1 text-sm text-gray-500">
        PNG, JPG ou WebP, com no máximo 5MB. Use uma imagem em formato
        widescreen (ex.: 4:1).
      </p>
      <div className="mt-5">
        {displayUrl ? (
          <div className="relative aspect-[4/1] w-full overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={displayUrl}
              alt={preview ? "Prévia do novo banner" : "Banner atual da loja"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/1] w-full items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500">
            Sem banner
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => void selectFile(event.target.files?.[0])}
            disabled={pending}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={pending}>
            {pending && !remove.isPending
              ? "Enviando..."
              : bannerUrl
                ? "Trocar"
                : "Enviar banner"}
          </Button>
          {bannerUrl ? (
            <Button
              variant="secondary"
              onClick={() => void deleteBanner()}
              disabled={pending}
            >
              {remove.isPending ? "Removendo..." : "Remover"}
            </Button>
          ) : null}
        </div>
      </div>
      {success ? (
        <p className="mt-3 text-sm text-emerald-700">{success}</p>
      ) : null}
      {error ? <p className="mt-3 text-sm font-medium">{error}</p> : null}
    </section>
  );
}
