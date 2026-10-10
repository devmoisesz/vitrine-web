/** Shareable discovery state, also used to translate legacy catalogue URLs. */
export function readStoreFilters(params: Pick<URLSearchParams, "get">) {
  const rawPage = Number(params.get("page") ?? "1");
  return {
    name: (params.get("name") ?? "").trim().slice(0, 200),
    page: Number.isSafeInteger(rawPage) && rawPage > 0 && rawPage <= 100000 ? rawPage : 1,
    segments: [...new Set((params.get("segments") ?? "").split(",")
      .filter(slug => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 100))].sort().slice(0, 100),
  };
}
export function storeDiscoveryHref(params: URLSearchParams) {
  const { name, page, segments } = readStoreFilters(params);
  const query = new URLSearchParams();
  if (name) query.set("name", name);
  if (segments.length) query.set("segments", segments.join(","));
  if (page > 1) query.set("page", String(page));
  if (params.get("origem") === "busca-global" || params.has("categoryId") || params.has("subcategoryId")) {
    query.set("origem", "busca-global");
  }
  return `/lojas${query.size ? `?${query}` : ""}`;
}
