import { twMerge } from "tailwind-merge";

interface ProductStatusBadgeProps {
  status: "ATIVO" | "INATIVO";
}

/**
 * Badge de status monocromático (texto/peso, sem cor).
 * "ATIVO" em peso médio, "INATIVO" em peso leve.
 */
export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  return (
    <span
      className={twMerge(
        "inline-block rounded-full border border-gray-200 px-2.5 py-0.5 text-xs uppercase tracking-wider",
        status === "ATIVO"
          ? "font-medium text-black"
          : "font-light text-gray-500",
      )}
    >
      {status === "ATIVO" ? "Ativo" : "Inativo"}
    </span>
  );
}
