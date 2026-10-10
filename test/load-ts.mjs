import fs from "node:fs";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import ts from "typescript";

export function load(relative, mocks = {}) {
  const filename = new URL("../" + relative, import.meta.url);
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = createRequire(filename);
  function requireModule(name) {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith("@/")) return load("src/" + name.slice(2) + ".ts", mocks);
    if (name.startsWith(".")) {
      const resolved = new URL(name + ".ts", filename);
      const root = new URL("../", import.meta.url);
      return load(decodeURIComponent(resolved.pathname.slice(root.pathname.length)), mocks);
    }
    return localRequire(name);
  }
  runInThisContext(`(function(require,module,exports){${source}\n})`)(requireModule, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
