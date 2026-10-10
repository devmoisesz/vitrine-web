export function readProductSelection(params: Pick<URLSearchParams, "get">, sizes: string[], stock: number) {
  const requested = Number(params.get("quantity") ?? "1");
  const size = params.get("size");
  return {
    size: size && sizes.includes(size) ? size : null,
    quantity: Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, Math.max(1, stock)) : 1,
  };
}
export function productSelectionHref(productId: string, search: string, size: string | null, quantity: number, hash = "") {
  const params = new URLSearchParams(search);
  if (size) params.set("size", size); else params.delete("size");
  if (quantity > 1) params.set("quantity", String(quantity)); else params.delete("quantity");
  return `/produto/${encodeURIComponent(productId)}${params.size ? `?${params}` : ""}${hash}`;
}
