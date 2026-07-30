# Vitrine Web — Spec: Detalhe do Produto

## 1. Contexto

Rota: `src/app/(public)/produto/[productId]/page.tsx`. Página pública — qualquer
visitante pode ver o produto. A ação de **adicionar ao carrinho** exige autenticação
(mesma regra já aplicada no card da Home).

## 2. Contrato de API

```
GET /products/:productId
Auth: Public
Resposta 200:
{
  "product": {
    "id": "uuid",
    "name": "Pants Black",
    "slug": "pants-black",
    "description": "Pants Black Masculine",
    "price": "69.79",
    "sizes": [],
    "stock": 39,
    "status": "ATIVO",
    "storeId": "uuid",
    "categoryId": "uuid",
    "subcategoryId": "uuid",
    "createdAt": "2026-07-24T23:57:40.960Z",
    "store": {
      "id": "uuid",
      "name": "store 013",
      "slug": "store-013",
      "logo_image_url": "https://..."
    }
  },
  "images": [
    { "id": "uuid", "productId": "uuid", "image_url": "https://...", "is_main": true }
  ]
}
```

**Atenção:** este formato (`{ product, images }`) é **diferente** do formato usado em
`GET /products` (lista, usado na Home), que retorna o produto achatado com
`products_images` embutido. Definir um tipo próprio para esta resposta — não reaproveitar
o tipo `Product` da Home sem adaptar.

```
POST /products/:productId/cart
Auth: JwtAuthGuard
Body: { "quantity": number, "size"?: string }
Resposta: 201

⚠️ O campo é "size", não "selectedSize" — correção necessária no hook
use-add-to-cart.ts já entregue para a Home, que usa o nome errado.
```

## 3. Regras de Negócio

- **Estoque não é por tamanho.** `stock` é um número único do produto inteiro — um
  produto com `stock: 5` e `sizes: ["P", "M", "G"]` tem 5 unidades no total, não 5 de
  cada tamanho. A UI não deve sugerir estoque individual por tamanho
- **Produto sem tamanhos** (`sizes: []`): não exibir seletor de tamanho, o botão de
  adicionar ao carrinho fica habilitado diretamente (sem exigir escolha)
- **Produto com tamanhos:** botão "Adicionar ao carrinho" só habilita depois de um
  tamanho selecionado
- **Sem estoque** (`stock <= 0`): botão de adicionar ao carrinho desabilitado, badge
  "Indisponível" visível, mas a página continua acessível (visualização não é bloqueada)
- **Visitante não autenticado:** ao tentar adicionar ao carrinho, redireciona para
  `/login?redirect=/produto/:id` (mesma regra do card da Home) — nunca bloqueia
  silenciosamente
- **Quantidade:** stepper simples, mínimo 1, sem máximo definido no frontend (o backend
  já rejeita se ultrapassar o estoque disponível — tratar esse erro na resposta, não
  validar client-side um limite arbitrário)

## 4. Layout e Componentes

```
┌──────────────────────────────────────────────┐
│  [Imagem principal grande]      Nome do produto│
│  [thumb][thumb][thumb][thumb]   Loja (link)    │
│                                  R$ 69,79       │
│                                  Tamanho: P M G │
│                                  Quantidade: [-1+]│
│                                  [Adicionar ao carrinho]│
│                                  Descrição do produto...│
└──────────────────────────────────────────────┘
```
Mobile: galeria em cima, informações abaixo (empilhado, mesma ordem).

```
components/product/
├── product-gallery.tsx        # imagem principal + thumbnails clicáveis
├── size-selector.tsx          # chips de tamanho, só renderiza se sizes.length > 0
├── quantity-selector.tsx      # stepper simples
└── add-to-cart-button.tsx     # já reaproveita a lógica de auth do card da Home

features/catalog/hooks/
└── use-product-detail.ts      # GET /products/:productId
```

### `ProductGallery`
- Imagem principal grande, thumbnails abaixo/ao lado (clicar troca a principal exibida)
- A imagem com `is_main: true` inicia como a exibida por padrão
- Sem zoom nem carrossel elaborado nesta versão — clique simples nas thumbnails

### `SizeSelector`
- Chips com cada valor de `sizes`, seleção única (mesmo padrão visual dos chips de
  categoria da Home, para consistência)
- Estado não selecionado bloqueia o botão de adicionar (ver regra de negócio acima)

### `AddToCartButton`
- Mesma lógica de decisão já usada no `ProductCard` da Home: não autenticado → redireciona
  pro login; sem estoque → desabilitado; com tamanhos → exige seleção antes de habilitar
- Ao clicar (autenticado, elegível): `POST /products/:productId/cart` com
  `{ quantity, size }` — omitir `size` do body se o produto não tiver tamanhos

## 5. Estados

- **Loading:** skeleton da galeria (retângulo cinza) + skeleton de texto nas informações
- **Produto não encontrado (404):** mensagem + botão "Voltar para o catálogo"
- **Erro de rede:** mensagem + botão "Tentar novamente"
- **Sucesso ao adicionar ao carrinho:** confirmação inline temporária (ex: "Adicionado ao
  carrinho" por alguns segundos), sem navegar automaticamente para o carrinho — deixa o
  cliente continuar navegando o produto se quiser

## 6. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
componentes de UI seguindo Base UI + tailwind-variants + tailwind-merge (Button já
existe em src/components/ui/). useAuth() já existe em
src/features/auth/hooks/use-auth.ts.

Tarefa: implementar a tela de detalhe do produto em
src/app/(public)/produto/[productId]/page.tsx, seguindo rigorosamente o documento
"Spec: Detalhe do Produto".

Pontos críticos a não deixar de fora:
- GET /products/:productId retorna { product, images } — formato DIFERENTE do usado
  na Home (que é achatado com products_images embutido). Criar um tipo próprio para
  esta resposta, não reaproveitar o tipo Product da Home sem adaptar
- POST /products/:productId/cart usa o campo "size" no body (NÃO "selectedSize") —
  atenção redobrada aqui, esse é um erro comum de digitação neste projeto
- Estoque (stock) é do produto inteiro, não por tamanho — nunca sugerir estoque
  individual por tamanho na UI
- Produto sem sizes (array vazio): não mostrar seletor de tamanho, botão de adicionar
  habilita direto
- Produto com sizes: exigir seleção antes de habilitar o botão de adicionar
- Visitante não autenticado clicando em adicionar: redirecionar para
  /login?redirect=/produto/:id (mesmo padrão já usado no ProductCard da Home)
- Estados: loading (skeleton), 404 (produto não encontrado, com botão de voltar), erro
  de rede (com retry), confirmação inline ao adicionar com sucesso (sem navegar
  automaticamente para o carrinho)
- Responsivo: galeria em cima no mobile, lado a lado no desktop

Não implementar: zoom de imagem, avaliações/reviews de produto, produtos relacionados —
fora do escopo desta tela por ora.
```