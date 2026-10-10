import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import nextServer from "next/server.js";
import { load } from "./load-ts.mjs";

const { NextRequest } = nextServer;
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

for (const method of ["google", "login"]) test(`${method} replaces both session cookies and clears an unresolved previous role`, async () => {
  global.fetch = async () => Response.json({ access_token: "new-access", refresh_token: "new-refresh" });
  const { POST } = load(`src/app/api/session/${method}/route.ts`, {
    "@/lib/session-role": { resolveUserRole: async () => null },
  });
  const response = await POST(new NextRequest(`http://localhost/api/session/${method}`, {
    method: "POST", headers: { Cookie: "accessToken=old-access; userRole=admin" }, body: "{}",
  }));
  for (const [name, value, maxAge] of [["accessToken", "new-access", 900], ["refreshToken", "new-refresh", 3600]]) {
    const cookie = response.cookies.get(name);
    assert.equal(cookie.value, value);
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.sameSite, "strict");
    assert.equal(cookie.path, "/");
    assert.equal(cookie.maxAge, maxAge);
  }
  assert.equal(response.cookies.get("userRole").value, "");
  assert.equal(response.headers.get("Cache-Control"), null);
});
