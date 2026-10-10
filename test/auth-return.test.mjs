import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "./load-ts.mjs";

const { authHref, safeReturnPath, loginDestination } = load("src/lib/login-destination.ts");
const { readProductSelection, productSelectionHref } = load("src/lib/product-selection.ts");
test("login and registration keep product, query, selections and hash", () => {
  const product = productSelectionHref("product-a", "from=campanha", "M", 3, "#detalhes");
  const login = authHref("/login", product);
  const registration = authHref("/cadastro", new URL(login, "https://local.test").searchParams.get("redirect"));
  const back = authHref("/login", new URL(registration, "https://local.test").searchParams.get("redirect"));
  for (const path of [login, registration, back]) assert.equal(loginDestination(new URL(path, "https://local.test").search, "Cliente"), product);
  assert.deepEqual(readProductSelection(new URL(product, "https://local.test").searchParams, ["M", "G"], 5), { size: "M", quantity: 3 });
});
test("destinations must be allowed for the authenticated role", () => {
  assert.equal(loginDestination(""), "/lojas");
  assert.equal(loginDestination("", "Admin"), "/admin");
  assert.equal(loginDestination("", "Proprietário"), "/painel");
  assert.equal(loginDestination("", "Funcionário"), "/painel");
  assert.equal(loginDestination("?redirect=/admin/segmentos", "Cliente"), "/lojas");
  assert.equal(loginDestination("?redirect=/painel/loja", "Funcionário"), "/painel");
  assert.equal(loginDestination("?redirect=/painel/produtos", "Funcionário"), "/painel/produtos");
  assert.equal(loginDestination("?redirect=/admin/segmentos", "Admin"), "/admin/segmentos");
  assert.equal(loginDestination("?redirect=/produto/a", "Admin"), "/produto/a");
  assert.equal(loginDestination("?redirect=/catalogo%3Fname%3DLoja"), "/lojas?name=Loja");
});
test("rejects external, unknown, encoded, API and auth-loop destinations", () => {
  for (const path of ["//evil.test", "/\\\\evil.test", "https://evil.test", "/", "/login?redirect=/login", "/cadastro/", "/session/restore", "/api/session/logout", "/unknown", "/%2f%2fevil.test", "/%6cogin", "/produto/a\n"]) {
    assert.equal(safeReturnPath(path), null, path);
    assert.equal(authHref("/cadastro", path), "/cadastro", path);
  }
});
test("restored selections are validated against current product sizes and stock", () => {
  assert.deepEqual(readProductSelection(new URLSearchParams("size=G&quantity=99"), ["M", "G"], 4), { size: "G", quantity: 4 });
  assert.deepEqual(readProductSelection(new URLSearchParams("size=invalid&quantity=-1"), ["M"], 4), { size: null, quantity: 1 });
  assert.equal(readProductSelection(new URLSearchParams("quantity=1.5"), [], 3).quantity, 1);
});
const originalWindow = global.window;
afterEach(() => { global.window = originalWindow; });
test("unauthenticated cart action requests login without adding items and keeps choices", () => {
  const routes = [];
  let mutations = 0;
  global.window = { location: { search: "?from=loja", hash: "#detalhes" } };
  const { AddToCartButton } = load("src/components/product/add-to-cart-button.tsx", {
    "next/navigation": { useRouter: () => ({ push: path => routes.push(path) }) },
    "@/components/ui/button": { Button: () => null },
    "@/features/auth/hooks/use-auth": { useAuth: () => ({ isAuthenticated: false, accessToken: null }) },
    "@/features/cart/hooks/use-add-to-cart": { useAddToCart: () => ({ isPending: false, mutate: () => mutations++ }) },
  });
  AddToCartButton({ productId: "a", quantity: 3, size: "M", requiresSize: true, outOfStock: false, onSuccess() {}, onError() {} }).props.onClick();
  assert.equal(mutations, 0);
  assert.equal(loginDestination(new URL(routes[0], "https://local.test").search), "/produto/a?from=loja&size=M&quantity=3#detalhes");
});
test("auth switch links carry the destination in both directions", () => {
  const destination = "/produto/a?size=G&quantity=2";
  for (const route of ["/login", "/cadastro"]) {
    const { AuthSwitchLink } = load("src/components/auth/auth-switch-link.tsx", {
      "next/link": ({ children, ...props }) => React.createElement("a", props, children),
      "next/navigation": { useSearchParams: () => new URLSearchParams({ redirect: destination }) },
    });
    const html = renderToStaticMarkup(React.createElement(AuthSwitchLink, { route }, "Continuar"));
    assert.ok(html.includes(route + "?redirect="));
    assert.ok(html.includes(encodeURIComponent(destination)));
  }
});
