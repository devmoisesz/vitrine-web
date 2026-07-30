# Vitrine Web — Spec: Vitrine da Loja (Perfil + Listagem de Produtos)

## 1. Contexto

Duas rotas públicas:
- `src/app/(public)/loja/[slug]/page.tsx` — **perfil da loja** (logo, nome, descrição, endereço)
- `src/app/(public)/loja/[slug]/produtos/page.tsx` — **listagem de produtos daquela loja**

O perfil funciona como uma "página de entrada" da loja; o CTA principal leva para a
listagem de produtos.

## 3. Contrato de API

### Perfil da loja
```
GET /store/:slug
Auth: deveria ser Public (ver bloqueio acima)
Resposta 200 (OutputStoreProfileDto):
{
  "name": "Loja Exemplo",
  "logo_url": "https://...",
  "description": "Loja de roupas",
  "whatsapp": "+551199999999",
  "address": {
    "id": "uuid",
    "label": "Matriz",
    "cep": "01001-000",
    "state": "SP",
    "city": "São Paulo",
    "neighborhood": "Centro",
    "street": "Rua Exemplo",
    "number": "123",
    "complement": null
  } | null
}
```
`address` pode ser `null` — nem toda loja tem endereço cadastrado (só é obrigatório se o
lojista cadastrou; ver regra de negócio "loja só pode ter um endereço").

### Listagem de produtos da loja
```
GET /store/:slug/products?name=&categoryId=&subcategoryId=&page=
Auth: Public
Resposta: mesma estrutura de GET /products (array de Product, ver types/catalog.ts da Home)
```
Mesma limitação de paginação já conhecida (sem `X-Total-Count` ainda — ver documento de
pendências da API). Reaproveitar o componente `Pagination` já construído.

## 4. Tela: Perfil da Loja (`/loja/[slug]`)

### Layout
```
┌──────────────────────────────────────────┐
│  [Header padrão do site]                   │
├──────────────────────────────────────────┤
│         [Logo da loja, centralizada]       │
│           Nome da Loja                    │
│     Descrição da loja em texto corrido... │
│                                            │
│     📍 Rua Exemplo, 123 - Centro          │
│        São Paulo/SP                       │
│                                            │
│        [ Ver produtos → ]                 │
└──────────────────────────────────────────┘
```
- Logo: se `logo_url` vier nulo/vazio, mostrar um placeholder simples (iniciais do nome
  da loja em um círculo, por exemplo) — nunca deixar espaço quebrado
- Descrição: texto livre da loja, sem limite de linhas imposto pelo layout (mas
  considerar `line-clamp` com "ver mais" se for muito longa)
- Endereço: só renderiza o bloco inteiro **se `address` não for `null`** — nenhuma loja
  é obrigada a ter endereço público
- **Não exibir o WhatsApp da loja diretamente nesta tela** — o contato acontece através
  do fluxo de carrinho/checkout, não como link direto aqui (evita que alguém pule o
  carrinho e a plataforma perca o registro do pedido)
- CTA principal, bem visível: **"Ver produtos"** → `/loja/[slug]/produtos`

### Estados
- Loading: skeleton (círculo cinza no lugar da logo + retângulos no lugar do texto)
- Loja não encontrada ou inativa (404): mensagem + botão "Voltar para o catálogo"
- Erro de rede: mensagem + botão "Tentar novamente"

## 5. Tela: Listagem de Produtos da Loja (`/loja/[slug]/produtos`)

Reaproveita a **mesma estrutura da Home** (grid, sidebar/chips de categoria, paginação),
só trocando a fonte de dados para `GET /store/:slug/products` em vez de `GET /products`.
**Não recriar** `ProductGrid`, `Pagination`, `CategorySidebar`, `CategoryChips` — são os
mesmos componentes já construídos, só muda o hook de fetch por trás.

### Diferenças em relação à Home
- Cabeçalho compacto da loja no topo (logo pequena + nome, com link de volta para
  `/loja/[slug]`) — no lugar da lupa/carrinho do header padrão, ou acima dele
- Filtros de categoria/subcategoria continuam funcionando (a rota aceita os mesmos
  parâmetros), mas agora filtram só dentro dos produtos daquela loja
- Sem opção de "todas as lojas" — o contexto já é uma loja só

### Estados
Mesmos da Home: loading (skeleton), vazio ("Esta loja ainda não tem produtos." — sem
"limpar filtros" se não houver filtro ativo, só quando a busca/filtro é que gera o
vazio), erro com retry.

## 6. Componentes Novos

```
components/store/
├── store-header.tsx       # logo + nome + descrição + endereço (tela de perfil)
├── store-address.tsx      # bloco de endereço, só renderiza se address existir
└── store-products-bar.tsx # cabeçalho compacto da listagem de produtos (logo pequena + nome + voltar)

features/store/
├── hooks/
│   ├── use-store-profile.ts    # GET /store/:slug
│   └── use-store-products.ts   # GET /store/:slug/products (reaproveita a lógica de use-products.ts, trocando o endpoint)
└── api/
    ├── fetch-store-profile.ts
    └── fetch-store-products.ts
```

## 7. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
componentes de UI seguindo Base UI + tailwind-variants + tailwind-merge. Os componentes
ProductGrid, Pagination, CategorySidebar e CategoryChips já existem em
src/components/catalog/ (construídos para a Home) — REAPROVEITAR, não recriar.

Tarefa: implementar as duas telas de vitrine da loja, seguindo rigorosamente o documento
"Spec: Vitrine da Loja (Perfil + Listagem de Produtos)":
1. src/app/(public)/loja/[slug]/page.tsx — perfil da loja
2. src/app/(public)/loja/[slug]/produtos/page.tsx — listagem de produtos da loja

Perfil da loja (GET /store/:slug):
- Logo centralizada (com placeholder de iniciais se logo_url vier vazio), nome,
  descrição, endereço (só renderizar o bloco se address não for null)
- NÃO exibir o número de WhatsApp da loja diretamente nesta tela
- CTA principal "Ver produtos" levando para /loja/[slug]/produtos
- Estados: loading (skeleton), loja não encontrada (404, com botão de voltar ao
  catálogo), erro de rede (com retry)

Listagem de produtos da loja (GET /store/:slug/products?name=&categoryId=&subcategoryId=&page=):
- Reaproveitar EXATAMENTE os componentes ProductGrid, Pagination, CategorySidebar e
  CategoryChips já existentes — só trocar a fonte do fetch (hook novo
  use-store-products.ts em vez de use-products.ts)
- Cabeçalho compacto no topo: logo pequena + nome da loja + link de volta para o
  perfil da loja
- Sem opção "todas as lojas" no filtro — contexto já é uma loja só
- Estado vazio: "Esta loja ainda não tem produtos." (mensagem diferente da Home)

Toda chamada HTTP usa credentials: 'include' (mesmo sendo rotas públicas, mantém
consistência com o resto do projeto).

Não implementar: avaliações da loja, mapa de localização — fora do escopo por ora.
```