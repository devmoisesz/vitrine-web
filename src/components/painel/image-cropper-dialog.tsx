"use client";

import { Dialog } from "@base-ui/react/dialog";
import Cropper from "react-easy-crop";
import { X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageCropperDialogProps {
  file: File;
  aspectRatio: number; // 1 para logo, 4 para banner
  isOpen: boolean;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
  /** Exibe loading no botão de confirmar durante o upload */
  isUploading?: boolean;
}

interface CropArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Renderiza a área selecionada num <canvas> e converte em arquivo via
 * canvas.toBlob(). O backend recebe sempre um arquivo já cortado no formato
 * certo — sem saber que houve edição.
 */
function getCroppedFile(
  imageSource: CanvasImageSource,
  croppedAreaPixels: CropArea,
  fileType: string,
): Promise<File> {
  const { width, height } = croppedAreaPixels;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return Promise.reject(new Error("Não foi possível processar a imagem."));
  }

  context.drawImage(
    imageSource,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    width,
    height,
  );

  // Normaliza para png/jpeg conforme o tipo original
  const type = fileType === "image/png" ? "image/png" : "image/jpeg";
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Não foi possível processar a imagem."));
          return;
        }
        const extension = type === "image/png" ? "png" : "jpg";
        resolve(
          new File([blob], `cropped-${Date.now()}.${extension}`, { type }),
        );
      },
      type,
      0.92,
    );
  });
}

/**
 * Conteúdo interno do crop — remontado via `key` quando o arquivo muda,
 * o que zera o zoom/posição naturalmente sem setState em effect.
 */
function CropperBody({
  file,
  aspectRatio,
  onConfirm,
  isUploading,
}: {
  file: File;
  aspectRatio: number;
  onConfirm: (croppedFile: File) => void;
  isUploading: boolean;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null,
  );
  const imageRef = useRef<HTMLImageElement>(null);

  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);

  async function handleConfirm() {
    const image = imageRef.current;
    if (!image || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedFile(
        image,
        croppedAreaPixels,
        file.type,
      );
      onConfirm(croppedFile);
    } catch (error) {
      // @todo: exibir erro dentro do dialog
      console.error(error);
    }
  }

  return (
    <>
      <div className="relative mt-5 h-72 w-full overflow-hidden rounded-lg bg-gray-900">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_area, areaPixels) =>
            setCroppedAreaPixels(areaPixels)
          }
          showGrid
          style={{ containerStyle: { width: "100%", height: "100%" } }}
        />
        {/* Imagem oculta usada para o canvas — mesma src do Cropper. Usamos
            <img> (não next/image) porque precisa ser referenciada por
            canvas.drawImage(), que exige um HTMLImageElement real. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imageRef} src={imageUrl} alt="" className="hidden" />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="text-sm text-gray-500">Zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="flex-1"
          aria-label="Zoom da imagem"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Dialog.Close render={<Button type="button" variant="secondary" />}>
          Cancelar
        </Dialog.Close>
        <Button
          onClick={() => void handleConfirm()}
          disabled={isUploading || !croppedAreaPixels}
        >
          {isUploading ? "Enviando..." : "Confirmar"}
        </Button>
      </div>
    </>
  );
}

export function ImageCropperDialog({
  file,
  aspectRatio,
  isOpen,
  onConfirm,
  onCancel,
  isUploading = false,
}: ImageCropperDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-xl md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="font-serif text-2xl">
                  Ajustar imagem
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-gray-500">
                  Arraste para posicionar e use a barra abaixo para dar zoom. O
                  arquivo é cortado automaticamente na proporção indicada.
                </Dialog.Description>
              </div>
              <Dialog.Close
                render={
                  <Button variant="ghost" size="sm" aria-label="Fechar" />
                }
              >
                <X />
              </Dialog.Close>
            </div>

            {isOpen && (
              <CropperBody
                key={`${file.name}-${file.size}`}
                file={file}
                aspectRatio={aspectRatio}
                onConfirm={onConfirm}
                isUploading={isUploading}
              />
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
