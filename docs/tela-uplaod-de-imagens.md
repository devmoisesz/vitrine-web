# Vitrine Web — Spec: Gestão de Imagens do Produto (Colaborador)

## 1. Contexto

Componente usado dentro do formulário de **criar/editar produto** da área do colaborador
(`Funcionário` ou `Proprietário`). Não é uma rota isolada — vive embutido na tela de
produto, mas é complexo o suficiente para merecer spec própria.

## 2. Regras de Negócio (fonte: backend)

- Um produto aceita **no mínimo 1 e no máximo 5 imagens** (regra de negócio — **não
  enforçada pelo endpoint de exclusão**, ver aviso abaixo).
- A API só aceita **um arquivo por upload** (`POST /stores/:slug/productimages/:productId`,
  `FormFile file` + body opcional `is_main`).
- Arquivo aceito: `.png`, `.jpg`, `.jpeg`, `.webp`, **máximo 2MB** (confirmado no código:
  `MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 })`).
- **A primeira imagem enviada para um produto sempre vira a principal**, independente do
  valor de `is_main` enviado — regra aplicada pelo backend (`UploadProductImagesService`).
- **O backend permite promover uma nova imagem a principal a qualquer momento.** Se o
  colaborador enviar uma nova imagem com `is_main: true`, o backend automaticamente
  **rebaixa a imagem principal atual** (`updateIsMain(currentMainImage.id, false)`) e
  promove a nova, sem apagar nada.
- **Novo endpoint dedicado:** `PATCH /stores/:slug/productimages/:productId/:imageId/set-main`
  — mesmos guards dos demais (`JwtAuthGuard` + `StoreAccessGuard`, roles `FUNCIONARIO` |
  `PROPRIETARIO`), sem body, retorna `204`. Rebaixa a principal atual e promove a imagem do
  `imageId` informado — **sem envolver upload ou exclusão de arquivo**. Esse endpoint
  substitui a necessidade de deletar+reatribuir só para trocar qual imagem já existente é
  a principal.
- `PATCH /stores/.../productimages/:productId/:imageId` **substitui o arquivo** de uma
  imagem já existente, preservando o valor de `is_main` que ela já tinha.
- `DELETE /stores/.../productimages/:productId/:imageId?newMainId=` remove uma imagem. Se
  a removida era a principal e `newMainId` não for informado, **o backend escolhe
  automaticamente a imagem mais recente entre as restantes como nova principal**
  (`DeleteProductImageService`). Se não restar nenhuma imagem, o backend **não bloqueia** —
  o produto fica com 0 imagens.

**Decisão de UX (confirmada):** a checkbox "Definir como imagem principal" fica **sempre
habilitada** durante o upload de uma nova imagem — menos fricção, e o backend já garante a
troca com segurança. Para trocar a principal entre imagens **já existentes**, sem precisar
subir arquivo novo, usa-se o botão "Marcar como principal" em qualquer card (novo endpoint
`set-main`) — não há mais perda de imagem em nenhum caminho.

**⚠️ O frontend precisa bloquear a exclusão da última imagem restante.** O backend não
impede remover a única imagem de um produto (deixando 0 imagens), o que viola a regra de
negócio "produto precisa de ao menos 1 imagem". Desabilitar o botão "Remover" no card
quando `images.length === 1`.

**Correção aplicada no `ChangeProductImageService` (rota PATCH de trocar arquivo):** faltava
`return` na chamada final de `productsImagesRepository.create(...)`. Com o `return`
adicionado, o endpoint passa a devolver o novo registro (`id`, `productId`, `image_url`,
`storage_public_id`, `is_main`, `createdAt`) — mesmo formato do `POST`. **O frontend pode
usar esse retorno para atualizar o item no estado local diretamente** (o `id` muda em
relação à imagem antiga, já que ela é removida e recriada — mas isso já vem correto na
resposta, sem precisar re-buscar a lista inteira).

## 3. Estados da Tela

### 3.1 Estado vazio (produto sem nenhuma imagem)
- Dropzone/input de arquivo, sem checkbox visível
- Texto de apoio: *"A primeira imagem enviada será a imagem principal do produto."*
- Bloqueio de salvar/publicar o produto enquanto não houver ao menos 1 imagem

### 3.2 Estado com 1 a 4 imagens
- Grid de thumbnails das imagens já enviadas (ver 3.4)
- Dropzone de novo upload sempre visível abaixo/ao lado do grid
- Checkbox "Definir como imagem principal" **habilitada, desmarcada por padrão**, com texto
  de apoio: *"Marcar esta imagem como principal (substitui a atual)."* Se marcada e o
  upload for concluído, a imagem principal anterior é automaticamente rebaixada pelo
  backend — nenhuma confirmação extra é necessária, já que nada é apagado nesse caminho.

### 3.3 Estado com 5 imagens (limite atingido)
- Dropzone de upload **oculta ou desabilitada**
- Texto: *"Limite de 5 imagens atingido. Remova uma imagem para adicionar outra."*

### 3.4 Card de imagem existente (grid)
Cada card exibe:
- Thumbnail da imagem
- Badge **"Principal"** apenas na imagem com `is_main: true`
- Botão **Marcar como principal** → visível apenas em imagens que **não** são a principal →
  `PATCH .../:imageId/set-main` (sem confirmação necessária, ação não-destrutiva)
- Botão **Trocar** → abre seletor de arquivo → `PATCH .../:imageId` (mantém o mesmo `is_main`)
- Botão **Remover** → `DELETE .../:imageId`; **desabilitado se for a única imagem restante**
  (ver seção 2)

## 4. Fluxos Detalhados

### 4.1 Upload da primeira imagem
1. Colaborador seleciona um arquivo
2. Sistema envia `POST /stores/:slug/productimages/:productId` (sem precisar enviar `is_main`)
3. Backend define automaticamente como principal
4. UI atualiza o grid mostrando a badge "Principal" nessa imagem

### 4.2 Upload de imagem adicional (produto já tem principal)
1. Colaborador seleciona um arquivo
2. Checkbox "Definir como imagem principal" aparece **habilitada**, desmarcada por padrão
3a. Se **não marcar**: envia `is_main: false` (ou omitido) → nova imagem entra no grid sem badge
3b. Se **marcar**: envia `is_main: true` → backend rebaixa a principal atual e promove a
    nova automaticamente → UI re-busca/atualiza o grid movendo a badge "Principal" para a
    imagem recém-enviada

### 4.3 Remover uma imagem
- Confirmar remoção (diálogo simples: "Remover esta imagem?") → `DELETE .../:imageId`
  (sem `newMainId` — deixar o backend escolher automaticamente)
- Se a imagem removida **não era a principal**: some do grid, nada mais muda
- Se a imagem removida **era a principal**: o backend promove automaticamente a imagem
  mais recente entre as restantes. UI re-busca a lista e mostra a badge "Principal" na
  nova escolhida. Se o colaborador preferir outra, basta clicar em "Marcar como principal"
  nela (fluxo 4.5) — nenhuma foto foi perdida
- Se for a **última imagem restante**: botão "Remover" fica desabilitado, com tooltip
  *"O produto precisa de ao menos 1 imagem."* — nenhuma chamada é feita à API

### 4.5 Marcar uma imagem existente como principal
1. Colaborador clica em "Marcar como principal" em qualquer card que não seja a atual principal
2. `PATCH .../:imageId/set-main` (sem body)
3. UI re-busca a lista (ou atualiza localmente: desmarca a badge da antiga, marca na nova)

### 4.4 Trocar o arquivo de uma imagem (sem mudar quem é principal)
1. Colaborador clica em "Trocar" em qualquer card
2. Seleciona novo arquivo
3. `PATCH .../:imageId` com o novo arquivo
4. Thumbnail atualiza, badge "Principal" permanece onde já estava (se era a principal, continua sendo)

## 5. Wireframe (referência textual)

```
┌─────────────────────────────────────────────────────────┐
│ Imagens do produto (3/5)                                 │
│                                                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │ [Principal]│  │           │  │           │              │
│  │  [thumb]   │  │  [thumb]  │  │  [thumb]  │              │
│  │ Trocar Rem.│  │Marcar prin.│ │Marcar prin.│             │
│  │            │  │ Trocar Rem│  │ Trocar Rem│              │
│  └───────────┘  └───────────┘  └───────────┘              │
│                                                            │
│  ┌─────────────────────────────────────────┐              │
│  │  + Adicionar imagem                       │              │
│  │  ☐ Marcar como imagem principal            │              │
│  │  "Substitui a principal atual, se houver" │              │
│  └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

## 6. Componentes React sugeridos

```
components/product/
├── ProductImageManager.tsx     # orquestra estado geral (lista, limite de 5, refetch)
├── ProductImageCard.tsx        # thumbnail + badge + botões marcar/trocar/remover
└── ProductImageUploader.tsx    # dropzone + checkbox de imagem principal
```

`ProductImageManager` mantém:
- `images: ProductImage[]` (do backend — atualizado com o retorno direto de upload/trocar/
  set-main; re-buscado após remover, já que a resposta é `204` sem corpo)
- `canUpload: boolean` (`images.length < 5`)
- `canRemove(image): boolean` (`images.length > 1`) — controla o botão "Remover" por card
- `hasMain: boolean` (`images.some(img => img.is_main)`) — usado só para o **texto de apoio**
  da checkbox do uploader ("será a principal" vs. "substitui a atual")

## 7. Erros e Validações no Front

- Tipo de arquivo inválido (aceitar apenas `image/jpeg`, `image/png`, `image/webp`)
- Tamanho máximo de arquivo: **2MB**, validar no cliente antes do upload (evita round-trip desnecessário)
- Falha de rede/upload → mensagem de erro no card correspondente, permitir tentar novamente
- Tentativa de remover a última imagem restante → bloqueio com mensagem, sem chamar a API

## 8. Endpoints Envolvidos

| Ação | Endpoint |
|---|---|
| Upload de nova imagem | `POST /stores/:slug/productimages/:productId` |
| Trocar arquivo de imagem existente | `PATCH /stores/:slug/productimages/:productId/:imageId` |
| Marcar imagem existente como principal (novo) | `PATCH /stores/:slug/productimages/:productId/:imageId/set-main` |
| Remover imagem (backend reatribui principal automaticamente, se preciso) | `DELETE /stores/:slug/productimages/:productId/:imageId?newMainId=` |