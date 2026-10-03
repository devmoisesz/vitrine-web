import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { runInThisContext } from 'node:vm';
import ts from 'typescript';

const filename = new URL('../src/app/api/catalog/[...path]/route.ts', import.meta.url);
const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
runInThisContext(`(function(require,module,exports){${source}\n})`)(createRequire(filename), loaded, loaded.exports);
const { GET } = loaded.exports;
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });
process.env.NEXT_PUBLIC_API_URL = 'http://backend.test';
const request = new Request('http://frontend.test/api/catalog/store/linha/products?name=camisa&page=2&categoryId=cat&private=true', {
  headers: { Cookie: 'refreshToken=secret', Authorization: 'Bearer secret' },
});

test('public catalog retains store, filters, page and count without forwarding session data', async () => {
  global.fetch = async (url, options) => {
    assert.equal(url.href, 'http://backend.test/store/linha/products?name=camisa&page=2&categoryId=cat');
    assert.equal(options.headers, undefined);
    assert.equal(options.cache, 'no-store');
    return Response.json([{ id: 'product' }], { headers: { 'X-Total-Count': '41' } });
  };
  const response = await GET(request, { params: Promise.resolve({ path: ['store', 'linha', 'products'] }) });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Total-Count'), '41');
  assert.deepEqual(await response.json(), [{ id: 'product' }]);
});

test('public proxy rejects global products, administrative paths and path traversal', async () => {
  global.fetch = () => { throw new Error('must not call upstream'); };
  for (const path of [['products'], ['stores', 'admin'], ['me'], ['store', '..', 'products'], ['https:', 'other.test']]) {
    assert.equal((await GET(request, { params: Promise.resolve({ path }) })).status, 404);
  }
});

test('public proxy preserves 404 and handles unavailable upstream', async () => {
  const context = { params: Promise.resolve({ path: ['store', 'missing'] }) };
  global.fetch = async () => Response.json({}, { status: 404 });
  assert.equal((await GET(request, context)).status, 404);
  global.fetch = async () => { throw new Error('offline'); };
  assert.equal((await GET(request, context)).status, 503);
});
