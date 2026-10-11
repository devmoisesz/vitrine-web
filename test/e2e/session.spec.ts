import { test, expect } from "@playwright/test";

const api = "http://127.0.0.1:4101";
const googleScript = `let configuration; window.google = { accounts: { id: {
  initialize: value => { configuration = value; },
  prompt: () => configuration.callback({ credential: 'fixture-admin-google' })
} } };`;
test.beforeEach(async ({ page, request }) => {
  await request.post(`${api}/__reset`);
  await page.route("https://accounts.google.com/gsi/client", route => route.fulfill({
    contentType: "application/javascript",
    body: googleScript,
  }));
});

test("Google becomes clickable after a delayed script without reloading the page", async ({ page }) => {
  let release!: () => void;
  const ready = new Promise<void>(resolve => { release = resolve; });
  await page.route("https://accounts.google.com/gsi/client", async route => {
    await ready;
    await route.fulfill({ contentType: "application/javascript", body: googleScript });
  });
  let documents = 0;
  page.on("request", req => { if (req.isNavigationRequest() && req.frame() === page.mainFrame()) documents++; });
  await page.goto("/login?redirect=/admin/segmentos", { waitUntil: "domcontentloaded" });
  try {
    await expect(page.getByRole("button", { name: "Preparando Google…" })).toBeDisabled();
  } finally { release(); }
  const google = page.getByRole("button", { name: "Continuar com Google" });
  await expect(google).toBeEnabled();
  expect(documents).toBe(1);
  await google.click();
  await expect(page.getByRole("heading", { name: "Segmentos de lojas", exact: true })).toBeVisible();
});

test("Google initializes again when returning to login with the script cached", async ({ page }) => {
  let scriptRequests = 0;
  page.on("request", req => { if (req.url() === "https://accounts.google.com/gsi/client") scriptRequests++; });
  await page.goto("/login?redirect=/admin/segmentos");
  await expect(page.getByRole("button", { name: "Continuar com Google" })).toBeEnabled();
  await page.getByRole("link", { name: "Criar conta", exact: true }).click();
  await expect(page).toHaveURL(/\/cadastro\?/);
  await page.getByRole("link", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?/);
  const google = page.getByRole("button", { name: "Continuar com Google" });
  await expect(google).toBeEnabled();
  expect(scriptRequests).toBe(1);
  await google.click();
  await expect(page.getByRole("heading", { name: "Segmentos de lojas", exact: true })).toBeVisible();
});

test("Google script failure is explained while password login remains available", async ({ page }) => {
  await page.route("https://accounts.google.com/gsi/client", route => route.abort());
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Google indisponível" })).toBeDisabled();
  await expect(page.getByText("Não foi possível carregar o Google. Você pode entrar com e-mail e senha.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeEnabled();
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
