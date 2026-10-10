import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ request }) => { await request.post("http://127.0.0.1:4101/__reset"); });

async function login(page: Page, email = "customer@example.test") {
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("test12345");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

test("discovery cards, accessible filters, URL state and legacy redirect", async ({ page }, info) => {
  await page.goto("/catalogo");
  await expect(page).toHaveURL(/\/lojas$/);
  await expect(page.getByRole("heading", { name: "Explorar lojas" })).toBeVisible();
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: "Explorar lojas" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Contato" })).toHaveCount(0);
  await expect(header.getByRole("button", { name: "Abrir busca" })).toHaveCount(0);
  await expect(page.locator("footer").getByRole("link", { name: "Contato" })).toBeVisible();
  const cards = page.locator('[data-slot="store-card"]');
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toContainText("FINAL DA DESCRIÇÃO.");
  await expect(cards.nth(1).locator("img")).toHaveCount(0);
  await expect(cards.nth(1).getByLabel("Segmentos da loja")).toHaveCount(0);
  await expect(cards.first().locator("img")).toHaveCSS("object-fit", "contain");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("explorar-lojas.png"), fullPage: true });
  await page.goto("/lojas?page=2");
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Filtrar lojas" });
  await expect(dialog).toBeVisible();
  const checkbox = dialog.getByRole("checkbox", { name: "Fitness", exact: true });
  await checkbox.focus();
  await page.keyboard.press("Space");
  await dialog.getByRole("checkbox", { name: "Cosméticos", exact: true }).check();
  await page.screenshot({ path: info.outputPath("filtrar-lojas.png"), fullPage: true });
  await dialog.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL(/segments=cosmeticos%2Cfitness$/);
  await expect(cards).toHaveCount(1);
  await page.getByRole("textbox", { name: "Buscar lojas pelo nome" }).fill("Loja de teste A");
  await expect(page).toHaveURL(/name=Loja\+de\+teste\+A&segments=/);
  await page.reload();
  await expect(cards).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Remover filtro Fitness" })).toBeVisible();
  await page.getByRole("button", { name: "Filtrar (2)" }).click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Filtrar (2)" })).toBeFocused();
  await page.getByRole("button", { name: "Limpar tudo" }).click();
  await expect(cards).toHaveCount(2);
  await page.goBack();
  await expect(cards).toHaveCount(1);
});

test("commercial entry and per-store catalogues remain public and isolated", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Sua loja/ })).toBeVisible();
  await page.goto("/loja/loja-a/produtos");
  await expect(page.getByText("Produto da loja A", { exact: true })).toBeVisible();
  await expect(page.getByText("Produto da loja B", { exact: true })).toHaveCount(0);
  await page.goto("/loja/loja-b");
  await expect(page.getByText("Produto da loja B", { exact: true })).toBeVisible();
  await expect(page.getByText("Produto da loja A", { exact: true })).toHaveCount(0);
});

test("discovery shows loading, empty results and a recoverable API error", async ({ page, request }) => {
  let release!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/catalog/stores?**", async route => { await waiting; await route.continue(); });
  await page.goto("/lojas");
  await expect(page.getByRole("status", { name: "Carregando lojas" })).toBeVisible();
  release();
  await expect(page.locator('[data-slot="store-card"]')).toHaveCount(2);
  await page.unroute("**/api/catalog/stores?**");
  await page.getByRole("textbox", { name: "Buscar lojas pelo nome" }).fill("Inexistente");
  await expect(page.getByText("Nenhuma loja encontrada para “Inexistente”.")).toBeVisible();
  await page.getByRole("button", { name: "Limpar busca e filtros" }).click();
  await expect(page.locator('[data-slot="store-card"]')).toHaveCount(2);
  await request.post("http://127.0.0.1:4101/__unavailable", { data: { value: true } });
  await page.reload();
  await expect(page.getByRole("alert").filter({ hasText: "Não foi possível carregar as lojas." })).toBeVisible();
  await request.post("http://127.0.0.1:4101/__unavailable", { data: { value: false } });
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator('[data-slot="store-card"]')).toHaveCount(2);
});

for (const register of [false, true]) test(`returns to product after ${register ? "registration" : "login"} without an automatic cart action`, async ({ page, request }) => {
  await page.goto("/produto/product-a?from=campanha");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "Aumentar quantidade" }).click();
  await page.getByRole("button", { name: "Aumentar quantidade" }).click();
  await expect(page).toHaveURL(/size=M&quantity=3/);
  await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?redirect=/);
  if (register) {
    await page.getByRole("link", { name: "Criar conta", exact: true }).click();
    await expect(page).toHaveURL(/\/cadastro\?redirect=/);
    await page.getByLabel("Nome completo").fill("Cliente de teste");
    await page.getByLabel("E-mail", { exact: true }).fill("new@example.test");
    await page.getByLabel("Senha", { exact: true }).fill("test12345");
    await page.getByLabel("Confirme sua senha").fill("test12345");
    await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  } else await login(page);
  await expect(page).toHaveURL(/\/produto\/product-a\?from=campanha&size=M&quantity=3$/);
  await expect(page.getByRole("heading", { name: "Produto da loja A" })).toBeVisible();
  const state = await (await request.get("http://127.0.0.1:4101/__state")).json();
  expect(state.calls.cart).toBe(0);
  expect(state.calls.accounts).toBe(register ? 1 : 0);
});

test("admin manages segments by name and store assignments while associated deletion is explained", async ({ page, request }) => {
  await page.goto("/login?redirect=/admin/segmentos");
  await login(page, "admin@example.test");
  await expect(page.getByRole("heading", { name: "Segmentos de lojas", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Excluir segmento Fitness", exact: true }).click();
  await page.getByRole("button", { name: "Excluir segmento", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "associado a lojas" })).toBeVisible();
  await expect(page.getByLabel("Slug", { exact: true })).toHaveCount(0);
  await page.getByLabel("Nome", { exact: true }).fill("Calçados");
  const creation = page.waitForRequest(req => req.url() === "http://127.0.0.1:4101/segments" && req.method() === "POST");
  await page.getByRole("button", { name: "Cadastrar segmento", exact: true }).click();
  expect((await creation).postDataJSON()).toEqual({ name: "Calçados" });
  await expect(page.getByRole("button", { name: "Editar segmento Calçados" })).toBeVisible();
  const created = (await (await request.get("http://127.0.0.1:4101/segments")).json()).find((segment: { name: string }) => segment.name === "Calçados");
  expect(created.slug).toBe("calcados");
  await page.getByRole("button", { name: "Editar segmento Calçados" }).click();
  await expect(page.getByLabel("Slug", { exact: true })).toHaveCount(0);
  await page.getByLabel("Nome", { exact: true }).fill("Sapatos");
  const edition = page.waitForRequest(req => req.url() === `http://127.0.0.1:4101/segments/${created.id}` && req.method() === "PUT");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  expect((await edition).postDataJSON()).toEqual({ name: "Sapatos" });
  await expect(page.getByRole("button", { name: "Editar segmento Sapatos" })).toBeVisible();
  await page.goto("/admin/lojas/loja-b/editar");
  await page.getByRole("checkbox", { name: "Fitness", exact: true }).check();
  await page.getByRole("checkbox", { name: "Cosméticos", exact: true }).check();
  await page.getByRole("button", { name: "Salvar segmentos", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Segmentos atualizados." })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Fitness", exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Cosméticos", exact: true })).toBeChecked();
});
