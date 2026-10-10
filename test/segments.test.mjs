import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "./load-ts.mjs";

test("segment validation and association conflicts retain their actionable API messages", () => {
  const { translateApiError } = load("src/lib/error-messages.ts");
  for (const message of [
    "Este segmento está associado a lojas. Remova as associações antes de excluí-lo.",
    "Já existe um segmento com esse nome ou slug.",
    "Informe segmentos válidos, sem repetições.",
  ]) assert.equal(translateApiError(message, 409), message);
});

test("store registration sends multiple segment IDs and editing preserves an explicit empty selection", async () => {
  const requests = [];
  const mocks = { "@/lib/api-client": { apiClient: async (path, options) => requests.push({ path, ...options }) } };
  const { registerStore } = load("src/features/admin/api/register-store.ts", mocks);
  const { updateStore } = load("src/features/painel/api/store.ts", mocks);
  await registerStore({ store_name: "Loja", owner_email: "owner@example.test", whatsapp: "11999999999", segmentIds: ["a", "b"] });
  assert.deepEqual(requests[0].body.segmentIds, ["a", "b"]);
  await updateStore("loja", { segmentIds: [] }, "test-token");
  assert.deepEqual(requests[1].body, { segmentIds: [] });
  assert.equal(requests[1].authenticated, true);
  assert.equal(requests[1].path, "/store/loja/edit");
});
