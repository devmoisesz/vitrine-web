# Vitrine Web — Spec: Home (Blocos por Loja + Modo de Busca)

## 1. Contexto

Rota: `src/app/(public)/page.tsx`. Substitui o grid plano de produtos como visão
**padrão** da Home — mas não descarta nada do que já existe. A Home agora tem **dois
modos**, alternando pelo estado do filtro na URL:

- **Modo padrão** (sem `name`, `categoryId` nem `subcategoryId` na query): blocos por
  loja, com banner + logo + amostra de produtos — o que estamos especificando agora
- **Modo de busca/filtro** (qualquer um desses parâmetros presente): **reaproveita
  exatamente** o `ProductGrid` + `Pagination` já construídos para a Home original —
  nenhum componente desse fluxo é recriado

A sidebar/chips de categoria (`CategorySidebar`/`CategoryChips`, já existentes) ficam
**sempre visíveis**, nos dois modos — são o próprio gatilho que leva ao modo de busca.

## 2. Contrato de API

### Novo endpoint — modo padrão
```
GET /home/stores?page=
Auth: Public
Resposta:
[
  {
    "id": "uuid",
    "name": "Loja Exemplo",
    "slug": "loja-exemplo",
    "banner_url": "https://..." | null,
    "logo_url": "https://..." | null,
    "products": [ /* Product[], já limitado a 6-8, mais recentes primeiro */ ]
  }
]
```
- Paginado **por loja** (sugestão: 5 lojas por página), não por produto
- Ordenação: **seed determinístico por dia** (ex: `ORDER BY MD5(id || current_date)`),
  não `RANDOM()` puro — evita repetir/pular lojas ao paginar (ver conversa anterior)
- `X-Total-Count` deveria refletir o **total de lojas**, não de produtos (mesmo padrão
  já pendente documentado para os outros endpoints paginados)

### Modo de busca/filtro — endpoint já existente, sem nenhuma mudança
```
GET /products?name=&categoryId=&subcategoryId=&page=
```

## 3. Regra de Negócio: Fallback de Banner

Quando `banner_url` for `null`: renderizar a **mesma área/proporção widescreen (~4:1)**
preenchida com **preto sólido** (`--color-black`), sem texto nem padrão decorativo por
cima. A logo continua sobreposta na mesma posição de sempre. Mesmo fallback usado tanto
aqui quanto na Vitrine da Loja (perfil público), para consistência entre onde a loja
aparece.

## 4. Layout — Modo Padrão (Blocos por Loja)

```
┌───────────────┬────────────────────────────────────────────┐
│ Categorias     │  ┌──────────────────────────────────────┐  │
│ (sidebar, ou   │  │ [banner widescreen 4:1, ou preto liso] │  │
│  chips no      │  │         [logo, sobreposta]              │  │
│  mobile)       │  │  Nome da Loja                           │  │
│                │  │  [prod][prod][prod][prod][prod] → scroll │  │
│                │  │              [ Ver todos os produtos ]  │  │
│                │  └──────────────────────────────────────┘  │
│                │  ┌──────────────────────────────────────┐  │
│                │  │ [próximo bloco de loja...]              │  │
│                │  └──────────────────────────────────────┘  │
│                │        «  Anterior   Próxima  »             │
└───────────────┴────────────────────────────────────────────┘
```

- **Banner:** largura total do bloco, proporção ~4:1
- **Logo:** sobreposta no banner, círculo, canto inferior esquerdo (mesmo padrão
  visual de capa+foto de perfil já mencionado como referência) — se `logo_url` também
  for nulo, usa o mesmo placeholder de iniciais já criado para a Vitrine da Loja
- **Produtos da loja:** **linha horizontal rolável** (não grid), reaproveitando o
  `ProductCard` já existente sem nenhuma modificação — mantém cada bloco com altura
  previsível independente de quantos produtos a loja tem
- **CTA "Ver todos os produtos"** → `/loja/:slug/produtos` (Vitrine da Loja já
  implementada)
- **Clicar no banner/logo/nome da loja** → `/loja/:slug` (perfil da loja)
- **Paginação:** reaproveitar o componente `Pagination` já existente (modo completo
  assim que `X-Total-Count` de lojas existir; degradado até lá)

## 5. Layout — Modo de Busca/Filtro

Idêntico ao que já existe hoje na Home original — nenhuma mudança:
- `ProductGrid` (grid plano, 2 colunas mobile / 3-4 desktop)
- `Pagination` (mesmo componente, mesmo comportamento)
- Estados de vazio/erro já especificados originalmente, sem alteração

**Transição entre os dois modos:** ao aplicar um filtro (buscar por nome ou selecionar
categoria), rolar suavemente para o topo do conteúdo — a estrutura visual muda bastante
entre os dois modos, então começar do topo evita uma transição confusa.

## 6. Componentes

```
app/(public)/
├── page.tsx                 # Server Component, decide o modo pelo searchParams
└── home-client.tsx           # Client Component, renderiza um dos dois modos

components/home/
├── store-block.tsx            # banner + logo + nome + linha de produtos + CTA
├── store-blocks-list.tsx      # lista de StoreBlock + loading/erro/vazio
└── store-block-skeleton.tsx   # skeleton de um bloco (banner + logo + cards)

# Reaproveitados sem alteração:
components/catalog/product-grid.tsx
components/catalog/pagination.tsx
components/catalog/category-sidebar.tsx
components/catalog/category-chips.tsx
components/product/product-card.tsx

features/home/
├── hooks/
│   └── use-home-stores.ts     # GET /home/stores
└── api/
    └── fetch-home-stores.ts

# Reaproveitado sem alteração:
features/catalog/hooks/use-products.ts
```

### Lógica de decisão de modo (`home-client.tsx`)
```tsx
const hasFilters = Boolean(searchParams.name || searchParams.categoryId || searchParams.subcategoryId);

return hasFilters ? (
  <ProductGrid ... />  // exatamente o que já existe
) : (
  <StoreBlocksList ... />  // novo
);
```

## 7. Estados — Modo Padrão

- **Loading:** `StoreBlockSkeleton` repetido ~3 vezes (retângulo do banner, círculo da
  logo, linha de retângulos menores pros produtos)
- **Vazio** (nenhuma loja com produtos ativos — cenário raro, mas cobrir): "Nenhuma
  loja disponível no momento."
- **Erro:** mensagem + botão "Tentar novamente"

## 8. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
componentes de UI seguindo Base UI + tailwind-variants + tailwind-merge. Os componentes
ProductGrid, Pagination, CategorySidebar, CategoryChips e ProductCard já existem e
implementam o modo de busca/filtro — REAPROVEITAR sem nenhuma alteração, não recriar.

Tarefa: implementar a nova Home com dois modos, seguindo rigorosamente o documento
"Spec: Home (Blocos por Loja + Modo de Busca)".

Modo padrão (sem name/categoryId/subcategoryId na URL) — NOVO:
- GET /home/stores?page= retorna lojas com banner_url, logo_url e products (já limitado
  a 6-8, mais recentes primeiro)
- Cada StoreBlock: banner widescreen (~4:1) com fallback preto sólido quando
  banner_url for null; logo sobreposta em círculo no canto inferior esquerdo do banner
  (placeholder de iniciais já existente se logo_url também for null); nome da loja;
  linha horizontal ROLÁVEL de ProductCard (reaproveitar o componente existente sem
  modificar); CTA "Ver todos os produtos" para /loja/:slug/produtos
- Clicar no banner, logo ou nome da loja leva para /loja/:slug
- Reaproveitar o componente Pagination existente, paginado por loja (não por produto)
- Estados: loading (StoreBlockSkeleton x3), vazio, erro (com retry)

Modo de busca/filtro (qualquer um dos parâmetros presente na URL) — SEM MUDANÇA:
- Renderizar exatamente o ProductGrid + Pagination já existentes, sem nenhuma alteração
  de lógica ou visual

CategorySidebar/CategoryChips SEMPRE visíveis, nos dois modos — clicar numa categoria
ali é o que dispara a troca para o modo de busca/filtro.

Ao trocar de modo (aplicar ou limpar filtro), rolar suavemente para o topo do
conteúdo — a estrutura visual muda bastante entre os dois modos.

Toda chamada HTTP usa credentials: 'include'.

Não implementar: destaque manual de lojas pelo Admin, ordenação alternativa (por
enquanto só a ordenação por seed diário do backend) — fora do escopo desta task.
```