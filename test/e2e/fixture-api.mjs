// Isolated, in-memory UI fixtures. Never imports .env or connects to a database.
// Real database filtering, migration and guards are covered in backend E2E tests.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const base = "http://127.0.0.1:4101";
let segments, stores, calls, unavailable, profileStatus, refreshStatus;
function reset() {
  segments = [
    { id: "00000000-0000-4000-8000-000000000001", name: "Fitness", slug: "fitness" },
    { id: "00000000-0000-4000-8000-000000000002", name: "Cosméticos", slug: "cosmeticos" },
  ];
  stores = [
    { id: "store-a", name: "Loja de teste A", slug: "loja-a", description: "Descrição completa da loja, com atendimento próprio e catálogo independente. ".repeat(9) + "FINAL DA DESCRIÇÃO.", logo_image_url: base + "/logo.svg", bannerUrl: null, segments: [...segments] },
    { id: "store-b", name: "Loja de teste B", slug: "loja-b", description: "Loja sem logo e sem segmentos.", logo_image_url: null, bannerUrl: null, segments: [] },
  ];
  calls = { cart: 0, accounts: 0, profile: 0, refresh: 0 };
  profileStatus = 200;
  refreshStatus = 200;
  unavailable = false;
}
reset();
const token = role => ["e30", Buffer.from(JSON.stringify({ role, sub: role, sid: `session-${role}`, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url"), "fixture"].join(".");
const roleOf = req => {
  try { return JSON.parse(Buffer.from((req.headers.authorization ?? "").split(".")[1], "base64url").toString()).role; } catch { return "Cliente"; }
};
const product = slug => ({
  id: slug === "loja-a" ? "product-a" : "product-b", name: slug === "loja-a" ? "Produto da loja A" : "Produto da loja B",
  slug: "produto", description: "Produto disponível apenas nesta loja.", price: "40.00", sizes: ["M", "G"], stock: 8, status: "ATIVO",
  storeId: slug === "loja-a" ? "store-a" : "store-b", categoryId: "category", subcategoryId: "subcategory", createdAt: "2026-10-09T00:00:00.000Z",
  store: { id: slug === "loja-a" ? "store-a" : "store-b", slug, name: slug === "loja-a" ? "Loja de teste A" : "Loja de teste B" },
  products_images: [],
});
const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3100");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count, Retry-After");
  const url = new URL(req.url, base);
  const send = (data, status = 200) => { res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.end(status === 204 ? undefined : JSON.stringify(data)); };
  if (req.method === "OPTIONS") return send({}, 204);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  let body = {};
  try { body = JSON.parse(Buffer.concat(chunks).toString() || "{}"); } catch { /* Not needed by these fixtures. */ }
  const path = url.pathname;
  if (path === "/__reset") { reset(); return send({}); }
  if (path === "/__state") return send({ calls });
  if (path === "/__session-status") {
    profileStatus = body.profile ?? profileStatus;
    refreshStatus = body.refresh ?? refreshStatus;
    return send({});
  }
  if (path === "/__unavailable") { unavailable = Boolean(body.value); return send({}); }
  if (path === "/logo.svg") { res.setHeader("Content-Type", "image/svg+xml"); return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><rect width="300" height="100" fill="#222"/><text x="150" y="64" font-size="38" text-anchor="middle" fill="white">LOJA A</text></svg>'); }
  if (path === "/authenticate" || path === "/authenticate/google") {
    const role = body.email?.startsWith("admin") || body.id_token === "fixture-admin-google" ? "Admin" : body.email?.startsWith("owner") ? "Proprietário" : "Cliente";
    return send({ access_token: token(role), refresh_token: token(role) });
  }
  if (path === "/refresh") {
    calls.refresh++;
    if (refreshStatus !== 200) { res.setHeader("Retry-After", "1"); return send({}, refreshStatus); }
    const cookie = req.headers.cookie ?? "";
    const refresh = cookie.split(";").map(v => v.trim()).find(v => v.startsWith("refreshToken="))?.slice(13);
    return refresh ? send({ access_token: refresh, refresh_token: refresh }) : send({}, 401);
  }
  if (path === "/logout") return send({}, 204);
  if (path === "/accounts") { calls.accounts++; return send({}, 201); }
  if (path === "/me") {
    calls.profile++;
    if (profileStatus !== 200) { res.setHeader("Retry-After", "1"); return send({}, profileStatus); }
    return send({ user_name: "Cliente de teste", user_email: "customer@example.test", user_role: roleOf(req), store_slug: "loja-a", store_name: "Loja de teste A" });
  }
  if (path === "/carts") return send([]);
  if (path.endsWith("/cart")) { calls.cart++; return send({}, 201); }
  if (path === "/segments") {
    if (req.method === "GET") return send(segments);
    const entry = { ...body, id: randomUUID(), slug: body.slug || body.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") };
    segments.push(entry); return send(entry, 201);
  }
  if (path.startsWith("/segments/")) {
    const id = path.split("/")[2];
    if (req.method === "DELETE") {
      if (stores.some(store => store.segments.some(segment => segment.id === id))) return send({ message: "Este segmento está associado a lojas. Remova as associações antes de excluí-lo." }, 409);
      segments = segments.filter(segment => segment.id !== id); return send({}, 204);
    }
    const segment = segments.find(segment => segment.id === id);
    if (!segment) return send({}, 404);
    Object.assign(segment, body); return send(segment);
  }
  if (path === "/stores/admin") return send(stores.map(store => ({ ...store, status: "ATIVA" })));
  if (path === "/stores") {
    if (unavailable) return send({}, 503);
    const name = (url.searchParams.get("name") ?? "").toLowerCase();
    const selected = (url.searchParams.get("segments") ?? "").split(",").filter(Boolean);
    const result = stores.filter(store => store.name.toLowerCase().includes(name) && (!selected.length || store.segments.some(segment => selected.includes(segment.slug))));
    res.setHeader("X-Total-Count", result.length);
    const page = Number(url.searchParams.get("page") ?? 1);
    return send(result.slice((page - 1) * 20, page * 20));
  }
  if (path === "/categories" || path === "/subcategories") return send([]);
  if (path.startsWith("/products/")) {
    const item = product(path.endsWith("product-a") ? "loja-a" : "loja-b");
    return send({ product: item, images: [] });
  }
  if (path.startsWith("/store/")) {
    const slug = path.split("/")[2];
    const store = stores.find(store => store.slug === slug);
    if (!store) return send({}, 404);
    if (path.endsWith("/edit")) {
      if (body.segmentIds) store.segments = segments.filter(segment => body.segmentIds.includes(segment.id));
      return send({}, 204);
    }
    if (path.endsWith("/products")) { res.setHeader("X-Total-Count", "1"); return send([product(slug)]); }
    return send({ ...store, logo_url: store.logo_image_url, banner_url: null, whatsapp: "11999999999", address: null, payment_methods: [], delivery_methods: [] });
  }
  return send({}, 404);
});
server.listen(4101, "127.0.0.1");
