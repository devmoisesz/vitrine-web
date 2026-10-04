import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

function load(relative, mocks = {}) {
  const filename = new URL("../" + relative, import.meta.url);
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loaded = { exports: {} };
  const requireLocal = createRequire(filename);
  runInThisContext(`(function(require,module,exports){${source}\n})`)(
    name => Object.hasOwn(mocks, name) ? mocks[name] : requireLocal(name),
    loaded, loaded.exports,
  );
  return loaded.exports;
}

const { loginDestination } = load("src/lib/login-destination.ts");
test("normal login opens the catalogue and explicit purchase returns remain internal", () => {
  assert.equal(loginDestination(""), "/catalogo");
  assert.equal(loginDestination("?redirect=/produto/jaqueta"), "/produto/jaqueta");
  assert.equal(loginDestination("?next=/carrinhos/cart-id/checkout"), "/carrinhos/cart-id/checkout");
  assert.equal(loginDestination("?redirect=/painel"), "/painel");
});
test("login avoids root/auth loops and external return paths", () => {
  for (const value of ["/", "/login", "/login/", "/cadastro", "/session/restore?returnTo=/", "//outside.test", "https://outside.test", "/\\outside.test", "/test\n"]) {
    assert.equal(loginDestination("?redirect=" + encodeURIComponent(value)), "/catalogo", value);
  }
});

test("the home waits for session restoration without rendering the landing, then routes authenticated visitors", () => {
  let auth = { isLoading: true, isAuthenticated: false };
  const redirects = [];
  let effects = [];
  const { HomeEntry } = load("src/components/landing/home-entry.tsx", {
    react: { ...React, useEffect: callback => effects.push(callback) },
    "next/navigation": { useRouter: () => ({ replace: path => redirects.push(path) }) },
    "@/features/auth/hooks/use-auth": { useAuth: () => auth },
  });
  const render = () => {
    effects = [];
    const html = renderToStaticMarkup(React.createElement(HomeEntry, null, React.createElement("h1", null, "Landing comercial")));
    effects.forEach(effect => effect());
    return html;
  };
  assert.doesNotMatch(render(), /Landing comercial/);
  assert.deepEqual(redirects, []);
  auth = { isLoading: false, isAuthenticated: false };
  assert.match(render(), /Landing comercial/);
  assert.deepEqual(redirects, []);
  auth = { isLoading: true, isAuthenticated: true };
  assert.doesNotMatch(render(), /Landing comercial/);
  assert.deepEqual(redirects, []);
  auth = { isLoading: false, isAuthenticated: true };
  assert.doesNotMatch(render(), /Landing comercial/);
  assert.deepEqual(redirects, ["/catalogo"]);
});

test("store cache separates stores and all filters without displaying previous results", () => {
  const { useStoreProducts: queryOptions } = load("src/features/store/hooks/use-store-products.ts", {
    "@tanstack/react-query": { useQuery: config => config },
    "@/features/store/api/fetch-store-products": { fetchStoreProducts: () => {} },
  });
  const query = { name: "jaqueta", categoryId: "cat", subcategoryId: "sub", page: 2 };
  const a = queryOptions("loja-a", query);
  const b = queryOptions("loja-b", query);
  assert.notDeepEqual(a.queryKey, b.queryKey);
  for (const changed of [{ name: "camisa" }, { categoryId: "other" }, { subcategoryId: "other" }, { page: 1 }]) {
    assert.notDeepEqual(a.queryKey, queryOptions("loja-a", { ...query, ...changed }).queryKey);
  }
  assert.equal(a.placeholderData, undefined);
  assert.equal(b.placeholderData, undefined);
});

test("local product requests send store scope and filters to the server and retain its count", async () => {
  const paths = [];
  const { fetchStoreProducts } = load("src/features/store/api/fetch-store-products.ts", {
    "@/lib/public-catalog": { publicCatalog: async path => { paths.push(path); return { data: [{ id: path }], totalCount: 43 }; } },
  });
  const query = { name: "jaqueta", categoryId: "cat", subcategoryId: "sub", page: 2 };
  const a = await fetchStoreProducts("loja-a", query);
  const b = await fetchStoreProducts("loja-b", { page: 1 });
  assert.equal(paths[0], "/store/loja-a/products?name=jaqueta&categoryId=cat&subcategoryId=sub&page=2");
  assert.equal(paths[1], "/store/loja-b/products?page=1");
  assert.equal(a.totalCount, 43);
  assert.notDeepEqual(a.data, b.data);
});
