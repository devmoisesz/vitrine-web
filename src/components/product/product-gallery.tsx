"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductImage } from "@/types/catalog";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const mainImage = images.find((image) => image.is_main) ?? images[0];
  const [selectedImageUrl, setSelectedImageUrl] = useState(mainImage?.image_url);
  const selectedImage =
    images.find((image) => image.image_url === selectedImageUrl) ?? mainImage;

  return (
    <section aria-label={`Imagens de ${productName}`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {selectedImage ? (
          <Image src={selectedImage.image_url} alt={productName} fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">Sem imagem disponível</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button key={image.id ?? image.image_url} type="button" onClick={() => setSelectedImageUrl(image.image_url)} aria-label={`Exibir imagem ${index + 1}`} aria-pressed={selectedImage?.image_url === image.image_url} className="relative size-16 shrink-0 overflow-hidden border border-transparent aria-pressed:border-foreground">
              <Image src={image.image_url} alt="" fill unoptimized sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
