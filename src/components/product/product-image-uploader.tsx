"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

interface ProductImageUploaderProps {
  /** Se já existe alguma imagem (controla texto e checkbox) */
  hasExistingImages: boolean;
  /** Se o upload está em andamento */
  isUploading: boolean;
  /** Callback: (file, isMain) */
  onUpload: (file: File, isMain: boolean) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 1024 * 1024 * 2; // 2MB

export function ProductImageUploader({
  hasExistingImages,
  isUploading,
  onUpload,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMain, setIsMain] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações client-side
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato não aceito. Use PNG, JPG ou WebP.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("A imagem deve ter no máximo 2MB.");
      e.target.value = "";
      return;
    }

    setError(null);
    onUpload(file, isMain);
    // Reset checkbox após upload
    setIsMain(false);
  }

  return (
    <div>
      <label
        htmlFor="image-upload-input"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-8 text-center transition-colors hover:border-gray-500 ${
          isUploading ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="size-8 animate-spin text-gray-400" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              Enviando imagem...
            </p>
          </>
        ) : (
          <>
            <Upload className="size-8 text-gray-400" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              + Adicionar imagem
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PNG, JPG ou WebP · Máximo 2MB
            </p>
          </>
        )}
      </label>

      <input
        ref={inputRef}
        id="image-upload-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {/* Checkbox "Definir como imagem principal" só aparece se já existem imagens */}
      {hasExistingImages && (
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-500">
          <input
            type="checkbox"
            checked={isMain}
            onChange={(e) => setIsMain(e.target.checked)}
            className="size-4 rounded border-gray-300 text-black focus:ring-black"
            disabled={isUploading}
          />
          <span>Definir como imagem principal</span>
          <span className="text-xs text-gray-400">
            (substitui a principal atual)
          </span>
        </label>
      )}

      {/* Texto de apoio quando não há imagens */}
      {!hasExistingImages && (
        <p className="mt-3 text-center text-xs text-gray-400">
          A primeira imagem enviada será a imagem principal do produto.
        </p>
      )}

      {/* Erro */}
      {error && (
        <p className="mt-2 text-center text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
