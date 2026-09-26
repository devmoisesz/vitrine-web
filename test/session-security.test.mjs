import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { runInThisContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import nextServer from 'next/server.js';
const { NextRequest } = nextServer;
const testDirectory = path.dirname(fileURLToPath(import.meta.url));

// Exercise the actual TypeScript modules using Node's test runner; no extra test dependency.
function load(relativePath, mocks = {}) {
  const filename = path.resolve(testDirectory, '..', relativePath);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const mod = { exports: {} };
  const requireLocal = createRequire(filename);
  runInThisContext(`(function(require, module, exports) { ${outputText}\n})`, { filename })(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : requireLocal(name), mod, mod.exports,
  );
  return mod.exports;
}

const originalFetch = global.fetch;
const originalNavigator = Object.getOwnPropertyDescriptor(global, 'navigator');
afterEach(() => {
  global.fetch = originalFetch;
  if (originalNavigator) Object.defineProperty(global, 'navigator', originalNavigator);
  else delete global.navigator;
});
process.env.NEXT_PUBLIC_API_URL = 'http://backend.test';
const request = () => new NextRequest('http://frontend.test/api/session', {
  headers: { Cookie: 'refreshToken=refresh-secret; accessToken=old-access; userRole=ADMIN' },
});

test('logout forwards the refresh cookie and clears browser cookies after revocation', async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, 'http://backend.test/logout');
    assert.equal(options.headers.Cookie, 'refreshToken=refresh-secret');
    return new Response('{}', { status: 200 });
  };
  const response = await load('src/app/api/session/logout/route.ts').POST(request());
  assert.equal(response.status, 204);
  for (const name of ['refreshToken', 'accessToken', 'userRole']) {
    assert.equal(response.cookies.get(name).value, '');
  }
});

for (const failure of ['http', 'network']) {
  test(`logout preserves cookies and reports ${failure} failure so revocation can be retried`, async () => {
    global.fetch = async () => {
      if (failure === 'network') throw new Error('offline');
      return new Response('unavailable', { status: 503 });
    };
    const response = await load('src/app/api/session/logout/route.ts').POST(request());
    assert.equal(response.status, 502);
    assert.equal(response.headers.get('set-cookie'), null);
  });
}

for (const status of [401, 503]) {
  test(`refresh handles status ${status} without keeping revoked credentials or discarding retryable cookies`, async () => {
    global.fetch = async () => new Response('{}', { status });
    const response = await load('src/app/api/session/refresh/route.ts', {
      '@/lib/session-role': { resolveUserRole: async () => 'USER' },
    }).PATCH(request());
    assert.equal(response.status, status);
    if (status === 401) {
      for (const name of ['refreshToken', 'accessToken', 'userRole']) assert.equal(response.cookies.get(name).value, '');
    } else assert.equal(response.headers.get('set-cookie'), null);
  });
}

test('successful refresh replaces both tokens and the effective role', async () => {
  global.fetch = async () => Response.json({ access_token: 'new-access', refresh_token: 'new-refresh' });
  const response = await load('src/app/api/session/refresh/route.ts', {
    '@/lib/session-role': { resolveUserRole: async () => 'USER' },
  }).PATCH(request());
  assert.equal(response.cookies.get('refreshToken').value, 'new-refresh');
  assert.equal(response.cookies.get('accessToken').value, 'new-access');
  assert.equal(response.cookies.get('userRole').value, 'USER');
  assert.equal(response.cookies.get('refreshToken').httpOnly, true);
});

for (const status of [204, 502]) {
  test(`client logout only clears memory after confirmed revocation (${status})`, async () => {
    const writes = [];
    let locks = 0;
    global.fetch = async () => new Response(null, { status });
    const { logout } = load('src/features/auth/api/authenticate.ts', {
      '@/lib/api-client': { ApiError: Error, setAccessToken: (value) => writes.push(value) },
      '@/lib/error-messages': { translateApiError: (value) => value },
      '@/lib/session-lock': { withSessionLock: async (action) => { locks++; return action(); } },
    });
    if (status === 204) { await logout(); assert.deepEqual(writes, [null]); }
    else { await assert.rejects(logout()); assert.deepEqual(writes, []); }
    assert.equal(locks, 1);
  });
}

test('refresh and logout use the same cross-tab lock', async () => {
  const names = [];
  Object.defineProperty(global, 'navigator', { configurable: true, value: {
    locks: { request: async (name, action) => { names.push(name); return action(); } },
  } });
  const lock = load('src/lib/session-lock.ts');
  const api = load('src/lib/api-client.ts', {
    './session-lock': lock, './error-messages': { translateApiError: (value) => value },
  });
  const auth = load('src/features/auth/api/authenticate.ts', {
    '@/lib/session-lock': lock, '@/lib/api-client': api,
    '@/lib/error-messages': { translateApiError: (value) => value },
  });
  global.fetch = async (url) => url.endsWith('/refresh')
    ? Response.json({ access_token: 'access', user_role: 'USER' })
    : new Response(null, { status: 204 });
  assert.equal(await api.refreshSession(), true);
  await auth.logout();
  assert.deepEqual(names, ['vitrine-session', 'vitrine-session']);
  assert.equal(api.getAccessToken(), null);
});

test('session actions still work when Web Locks are unavailable', async () => {
  Object.defineProperty(global, 'navigator', { configurable: true, value: {} });
  const result = await load('src/lib/session-lock.ts').withSessionLock(async () => 'done');
  assert.equal(result, 'done');
});

test('panel proxy delegates expired access to the coordinated browser refresh', async () => {
  const calls = [];
  global.fetch = async (url) => { calls.push(url); return new Response(null, { status: 401 }); };
  const response = await load('src/proxy.ts').proxy(new NextRequest('http://frontend.test/admin/lojas?page=2', {
    headers: { Cookie: 'refreshToken=refresh; accessToken=expired' },
  }));
  assert.deepEqual(calls, ['http://backend.test/me']);
  const destination = new URL(response.headers.get('location'));
  assert.equal(destination.pathname, '/session/restore');
  assert.equal(destination.searchParams.get('returnTo'), '/admin/lojas?page=2');
});

test('panel proxy still authorizes against the current backend role', async () => {
  global.fetch = async () => Response.json({ user_role: 'Cliente' });
  const response = await load('src/proxy.ts').proxy(new NextRequest('http://frontend.test/admin', {
    headers: { Cookie: 'refreshToken=refresh; accessToken=access; userRole=ADMIN' },
  }));
  assert.equal(response.headers.get('location'), 'http://frontend.test/');
});
