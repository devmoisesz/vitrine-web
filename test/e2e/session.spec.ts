import { test, expect } from "@playwright/test";

const api = "http://127.0.0.1:4101";
test.beforeEach(async ({ page, request }) => {
  await request.post(`${api}/__reset`);
  await page.route("https://accounts.google.com/gsi/client", route => route.fulfill({
    contentType: "application/javascript",
    body: `let configuration; window.google = { accounts: { id: {
      initialize: value => { configuration = value; },
      prompt: () => configuration.callback({ credential: 'fixture-admin-google' })
    } } };`,
  }));
});

test("Google login writes both cookies and opens admin without restoration or idle profile bursts", async ({ page, context, request }) => {
  const restores: string[] = [];
  page.on("request", req => { if (req.url().includes("/session/restore")) restores.push(req.url()); });
  await page.goto("/login?redirect=/admin/segmentos");
  await page.waitForFunction(() => Boolean(window.google));
  await page.getByRole("button", { name: "Continuar com Google" }).click();
  await expect(page.getByRole("heading", { name: "Segmentos de lojas", exact: true })).toBeVisible();
  const cookies = await context.cookies();
  for (const name of ["accessToken", "refreshToken"]) {
    expect(cookies.find(cookie => cookie.name === name)?.httpOnly).toBe(true);
  }
  expect(restores).toHaveLength(0);
  const initial = (await (await request.get(`${api}/__state`)).json()).calls.profile;
  await page.waitForTimeout(2500);
  expect((await (await request.get(`${api}/__state`)).json()).calls.profile).toBe(initial);
  expect(initial).toBeLessThanOrEqual(3);
});

test("429 navigation preserves cookies, waits and returns to the requested panel without home loops", async ({ page, context, request }) => {
  await page.goto("/login?redirect=/admin/segmentos");
  await page.getByLabel("E-mail", { exact: true }).fill("admin@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("test12345");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Segmentos de lojas", exact: true })).toBeVisible();
  await request.post(`${api}/__session-status`, { data: { profile: 429 } });
  const before = (await (await request.get(`${api}/__state`)).json()).calls.profile;
  await page.goto("/admin/categorias?page=2");
  await expect(page).toHaveURL(/\/session\/unavailable\?/);
  await expect(page.getByRole("alert").filter({ hasText: "Sua sessão foi preservada" })).toBeVisible();
  await page.waitForTimeout(2500);
  const after = (await (await request.get(`${api}/__state`)).json()).calls.profile;
  expect(after - before).toBeLessThanOrEqual(3);
  expect((await context.cookies()).some(cookie => cookie.name === "refreshToken")).toBe(true);
  await request.post(`${api}/__session-status`, { data: { profile: 200 } });
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/categorias\?page=2$/);
  await expect(page.getByRole("heading", { name: /Categorias/ }).first()).toBeVisible();
});

test("temporary refresh failure on reload shows recovery and keeps login cookies", async ({ page, context, request }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill("customer@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("test12345");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/lojas$/);
  await request.post(`${api}/__session-status`, { data: { refresh: 429 } });
  await page.reload();
  await expect(page.getByRole("alert").filter({ hasText: "Sua sessão foi preservada" })).toBeVisible();
  expect((await context.cookies()).some(cookie => cookie.name === "refreshToken")).toBe(true);
  await request.post(`${api}/__session-status`, { data: { refresh: 200 } });
  await expect(page.getByRole("button", { name: "Tentar novamente", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Sua sessão foi preservada" })).toHaveCount(0);
  await expect(page.locator('[data-slot="store-card"]')).toHaveCount(2);
});
