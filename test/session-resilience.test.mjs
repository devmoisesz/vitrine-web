import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import nextServer from 'next/server.js';
import { load } from './load-ts.mjs';

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });
process.env.NEXT_PUBLIC_API_URL = 'http://backend.test';
const request = () => new nextServer.NextRequest('http://frontend.test/admin/lojas?page=2', {
  headers: { Cookie: 'refreshToken=refresh; accessToken=access; userRole=admin' },
});

test('a new session with unresolved role does not inherit the previous account role', () => {
  const api = load('src/lib/api-client.ts');
  api.setAccessToken('old-admin', 'admin');
  api.setAccessToken('new-user', null);
  assert.equal(api.getAccessToken(), 'new-user');
  assert.equal(api.getUserRole(), null);
});

for (const status of [429, 503, 'network']) {
  test(`refresh ${status} preserves identity and throttles repeat attempts`, async () => {
    const api = load('src/lib/api-client.ts');
    let calls = 0, expired = 0;
    api.setAccessToken('access', 'admin');
    api.subscribeToSessionExpired(() => expired++);
    global.fetch = async () => {
      calls++;
      if (status === 'network') throw new Error('offline');
      return new Response('{}', { status, headers: { 'Retry-After': '30' } });
    };
    await assert.rejects(api.refreshSession());
    await assert.rejects(api.refreshSession());
    assert.equal(calls, 1);
    assert.equal(api.getAccessToken(), 'access');
    assert.equal(api.getUserRole(), 'admin');
    assert.equal(expired, 0);
  });
}

test('confirmed expiration clears identity and emits session expiration once', async () => {
  const api = load('src/lib/api-client.ts');
  let expired = 0, calls = 0;
  api.setAccessToken('access', 'admin');
  api.subscribeToSessionExpired(() => expired++);
  global.fetch = async () => { calls++; return new Response('{}', { status: 401 }); };
  assert.deepEqual(await Promise.all([api.refreshSession(), api.refreshSession()]), [false, false]);
  assert.equal(calls, 1);
  assert.equal(expired, 1);
  assert.equal(api.getAccessToken(), null);
  assert.equal(api.getUserRole(), null);
});

test('concurrent unauthorized requests share refresh and retry with the new token', async () => {
  const api = load('src/lib/api-client.ts');
  api.setAccessToken('old', 'admin');
  let refreshes = 0, retries = 0;
  global.fetch = async (url, options) => {
    if (url.endsWith('/refresh')) { refreshes++; return Response.json({ access_token: 'new', user_role: 'admin' }); }
    if (options.headers.Authorization === 'Bearer old') return new Response('{}', { status: 401 });
    assert.equal(options.headers.Authorization, 'Bearer new');
    retries++;
    return Response.json({ user_name: 'Admin' });
  };
  await Promise.all([api.apiClient('/me', { authenticated: true }), api.apiClient('/me', { authenticated: true })]);
  assert.equal(refreshes, 1);
  assert.equal(retries, 2);
});

test('profile Retry-After prevents immediate network refetches', async () => {
  const api = load('src/lib/api-client.ts');
  let calls = 0;
  global.fetch = async () => { calls++; return new Response('{}', { status: 429, headers: { 'Retry-After': '20' } }); };
  for (let i = 0; i < 3; i++) await assert.rejects(api.apiClient('/me', { accessToken: 'access' }), { status: 429 });
  assert.equal(calls, 1);
});

for (const status of [429, 503, 'network']) {
  test(`protected navigation ${status} goes to recovery without clearing cookies or looping through home`, async () => {
    global.fetch = async () => {
      if (status === 'network') throw new Error('offline');
      return new Response('{}', { status, headers: { 'Retry-After': '30' } });
    };
    const response = await load('src/proxy.ts').proxy(request());
    const location = new URL(response.headers.get('location'));
    assert.equal(location.pathname, '/session/unavailable');
    assert.equal(location.searchParams.get('returnTo'), '/admin/lojas?page=2');
    assert.equal(response.headers.get('set-cookie'), null);
  });
}

test('server refresh forwards Retry-After and preserves cookies on network failures', async () => {
  const route = load('src/app/api/session/refresh/route.ts');
  global.fetch = async () => new Response('{}', { status: 429, headers: { 'Retry-After': '27' } });
  const response = await route.PATCH(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '27');
  assert.equal(response.headers.get('set-cookie'), null);
  global.fetch = async () => { throw new Error('offline'); };
  const offline = await route.PATCH(request());
  assert.equal(offline.status, 503);
  assert.equal(offline.headers.get('set-cookie'), null);
});
