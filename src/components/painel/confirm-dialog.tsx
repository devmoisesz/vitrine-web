"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Se true, o botão de confirmar fica vermelho */
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  destructive,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onCancel();
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/30 backdrop:backdrop-blur-sm open:flex open:flex-col"
      onClick={(e) => {
        if (e.target === dialogRef.current) onCancel();
      }}
    >
      <div className="space-y-2 px-6 pb-4 pt-6">
        <h2 className="font-serif text-xl">{title}</h2>
        <p className="text-sm text-gray-500">{children}</p>
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          {cancelLabel}
        </button>
        <Button
          variant={destructive ? "primary" : "primary"}
          className={
            destructive
              ? "!bg-red-600 !border-red-600 hover:!bg-red-700"
              : undefined
          }
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
