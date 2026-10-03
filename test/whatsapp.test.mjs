import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runInThisContext } from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(fs.readFileSync(new URL('../src/lib/whatsapp.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
runInThisContext(`(function(require,module,exports){${source}\n})`)(() => ({}), loaded, loaded.exports);
const { buildWhatsappUrl } = loaded.exports;

test('store contact accepts Brazilian local and international formats without duplicating the country code', () => {
  for (const phone of ['16995051144', '(16) 99505-1144', '+55 16 99505-1144', '5516995051144']) {
    assert.equal(buildWhatsappUrl(phone, 'Olá, Linha!'), 'https://wa.me/5516995051144?text=Ol%C3%A1%2C%20Linha!');
  }
  assert.equal(buildWhatsappUrl('1633334444', 'Oi'), 'https://wa.me/551633334444?text=Oi');
  assert.equal(buildWhatsappUrl(null, 'Oi'), 'https://wa.me/?text=Oi');
});
