# TODO — Correção: cadastro de produto mostra erro mesmo com 201

## Causa raiz

O backend `POST /stores/:slug/products` retorna `201` com o corpo sendo **apenas o UUID** do produto (string pura, não JSON — `return product.id;` no controller). O `apiClient` faz `JSON.parse(responseText)` incondicionalmente, então lança `SyntaxError` ao tentar parsear a string crua → a mutation rejeita → UI mostra "Erro ao criar produto", apesar do produto ter sido criado.

## Passos

- [x] Investigar o fluxo de criação de produto (página, hook, api, api-client)
- [x] Confirmar formato real da resposta no backend (controller e service)
- [x] Editar `src/lib/api-client.ts` — tornar o parsing de resposta 2xx resiliente (se `JSON.parse` falhar, retornar o texto cru em vez de lançar erro)
- [x] Editar `src/features/painel/api/store.ts` — normalizar a resposta do `createProduct` para `{ id: string }` (aceitar string pura ou objeto `{ id }`)
- [x] Validar: `npx tsc --noEmit` sem erros
- [x] Validar: cadastrar produto → mensagem de sucesso + redirect para `/painel/produtos/{id}/imagens`

# TODO — UX de Upload de Imagens (botão Enviar + botão Salvar)

## Contexto

O `ProductImageUploader` enviava o upload automaticamente ao selecionar o arquivo, sem
nenhum botão de "Enviar"/"Salvar". O usuário quer: selecionar arquivo → botão "Enviar"
envia para a API → repetir até o máximo de 5 → botão "Salvar e concluir" sai da tela.

## Passos (decisão final: manter upload automático + apenas botão "Salvar")

- [x] `product-image-uploader.tsx` — mantido upload automático (sem botão "Enviar")
- [x] `product-image-manager.tsx` — toast de sucesso por upload + botão "Salvar" (desabilitado sem imagens ou durante upload)
- [x] `[productId]/imagens/page.tsx` — conectar `onSave` → `router.push("/painel/produtos")`
- [x] Validar: `npx tsc --noEmit` sem erros
