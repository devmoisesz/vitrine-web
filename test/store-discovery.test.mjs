import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "./load-ts.mjs";

const { storeDiscoveryHref, readStoreFilters } = load("src/lib/store-discovery.ts");
test("legacy catalogue preserves compatible search, segments and page, dropping product filters", async () => {
  const { default: Catalogue } = load("src/app/(public)/catalogo/page.tsx", {
    "next/navigation": { permanentRedirect: destination => { throw new Error(destination); } },
  });
  await assert.rejects(Catalogue({ searchParams: Promise.resolve({ name: "Loja A", segments: ["fitness", "cosmeticos"], page: "2", categoryId: "old", secret: "discard" }) }),
    { message: "/lojas?name=Loja+A&segments=cosmeticos%2Cfitness&page=2&origem=busca-global" });
  assert.equal(storeDiscoveryHref(new URLSearchParams("page=-1")), "/lojas");
});
test("shareable filters normalize duplicate segments and invalid pagination", () => {
  assert.deepEqual(readStoreFilters(new URLSearchParams("name=+Loja+&segments=fitness,fitness,cosmeticos&page=2")),
    { name: "Loja", segments: ["cosmeticos", "fitness"], page: 2 });
  assert.equal(readStoreFilters(new URLSearchParams("page=1.5")).page, 1);
});
test("discovery sends all filters to the API and retains its result count", async () => {
  const paths = [];
  const { fetchStoresSearch } = load("src/features/store/api/fetch-stores-search.ts", {
    "@/lib/public-catalog": { publicCatalog: async path => { paths.push(path); return { data: [{ id: "store" }], totalCount: 24 }; } },
  });
  const result = await fetchStoresSearch({ name: "Loja", page: 2, segments: ["fitness", "cosmeticos", "fitness"] });
  assert.equal(paths[0], "/stores?page=2&name=Loja&segments=cosmeticos%2Cfitness");
  assert.equal(result.totalCount, 24);
});
test("cache varies by search, page and segments, but not by segment order", () => {
  const { useStoresSearch } = load("src/features/store/hooks/use-stores-search.ts", {
    "@tanstack/react-query": { useQuery: options => options },
    "../api/fetch-stores-search": { fetchStoresSearch: () => {} },
  });
  const base = { name: "Loja", page: 2, segments: ["fitness", "cosmeticos"] };
  const original = useStoresSearch(base);
  assert.deepEqual(original.queryKey, useStoresSearch({ ...base, segments: [...base.segments].reverse() }).queryKey);
  for (const changed of [{ name: "Outra" }, { page: 1 }, { segments: ["fitness"] }, { segments: [] }]) {
    assert.notDeepEqual(original.queryKey, useStoresSearch({ ...base, ...changed }).queryKey);
  }
  assert.equal(original.placeholderData, undefined);
});
test("cards show the full description, contained square logos and no product controls", () => {
  const { StoreCard } = load("src/components/store/store-card.tsx", {
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    "next/image": props => React.createElement("img", Object.fromEntries(Object.entries(props).filter(([key]) => !["fill", "unoptimized"].includes(key)))),
  });
  const description = "Descrição longa da loja. ".repeat(100) + "FIM COMPLETO";
  const store = { id: "a", slug: "a", name: "Loja A", description, logo_image_url: "/logo.png", segments: [{ id: "s", name: "Fitness", slug: "fitness" }] };
  const html = renderToStaticMarkup(React.createElement(StoreCard, { store }));
  assert.ok(html.includes(description));
  assert.match(html, /object-contain/);
  assert.match(html, /aspect-square/);
  assert.match(html, /Fitness/);
  assert.match(html, /Explorar loja/);
  assert.doesNotMatch(html, /line-clamp|truncate|object-cover|rounded-full|carrinho/);
  const fallback = renderToStaticMarkup(React.createElement(StoreCard, { store: { ...store, logo_image_url: null, segments: [] } }));
  assert.doesNotMatch(fallback, /<img|Fitness|Segmentos da loja/);
  assert.match(fallback, /FIM COMPLETO/);
});
