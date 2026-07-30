# Vitrine Web — Spec: Buscar Lojas

## 1. Contexto

Rota: `src/app/(public)/lojas/page.tsx`. Página pública, sem autenticação necessária.
Diferente da busca de produtos da Home (que busca dentro do catálogo unificado), esta
tela busca **lojas** pelo nome — atende ao requisito "buscar lojas pelo nome" do
`requirements.md`, que ainda não tinha tela própria.

**Ponto de entrada:** adicionar um link "Lojas" no `Header` do site, apontando para
`/lojas` — hoje não existe nenhum caminho de navegação até essa tela.

## 2. Contrato de API

```
GET /stores?name=&page=
Auth: Public
Resposta 200 (array de Store):
[
  {
    "id": "uuid",
    "name": "Loja Exemplo",
    "slug": "loja-exemplo",
    "email": "contato@loja.com",
    "description": "Loja de roupas",
    "whatsapp": "+551199999999",
    "logo_image_url": "https://cdn.example.com/vitrine-web/logo.png",
    "createdAt": "2026-01-01T09:00:00.000Z"
  }
]
```

Mesma limitação já conhecida: **sem total de páginas** — reaproveitar o componente
`Pagination` já construído (modo degradado, anterior/próxima sem numeração completa).

**Atenção ao nome do campo de logo:** aqui vem como `logo_image_url` (mesma
inconsistência já documentada no arquivo de pendências da API — tratar com fallback,
igual já é feito no `getStoreLogo()` da Home).

## 3. Regras de Negócio

- Busca por nome, sem filtro de categoria (lojas não têm categoria — só produtos têm)
- Loja inativa não aparece nesta listagem (o backend já filtra isso, mesma regra do
  catálogo geral)
- Clicar em uma loja leva para `/loja/[slug]` (a tela de perfil da loja, já implementada)

## 4. Layout

```
┌────────────────────────────────────────────┐
│  [Header do site, com o novo link "Lojas"]   │
├────────────────────────────────────────────┤
│   [🔍 Buscar lojas pelo nome_____________]   │
├────────────────────────────────────────────┤
│  [Logo] Nome da Loja      [Logo] Nome Loja   │
│  Descrição curta...       Descrição curta... │
│                                               │
│  [Logo] Nome da Loja      [Logo] Nome Loja   │
│  ...                                         │
│                                               │
│         «  Anterior   Próxima  »             │
└────────────────────────────────────────────┘
```

Diferente da busca expansível da Home (ícone que vira input), aqui o campo de busca fica
**sempre visível** no topo da página — é o propósito central desta tela, não uma ação
secundária.

- Grid responsivo: 2 colunas mobile, 3–4 desktop (mesmo padrão de breakpoint do grid de
  produtos)
- Cada card: logo (com placeholder de iniciais se vazio, mesma regra já usada na Vitrine
  da Loja), nome, descrição truncada (1–2 linhas)

## 5. Componentes

```
app/(public)/lojas/page.tsx

components/store/
├── store-search-input.tsx    # input de busca, sempre visível (não expansível)
├── store-grid.tsx             # grid de StoreCard + estados de loading/vazio/erro
└── store-card.tsx             # logo + nome + descrição truncada, link para /loja/:slug

features/store/hooks/
└── use-stores-search.ts        # GET /stores?name=&page=
```

`StoreCard` pode reaproveitar o mesmo placeholder de iniciais já criado para o `StoreHeader`
da Vitrine da Loja — não recriar essa lógica.

## 6. Estados

- **Loading:** skeleton do grid (retângulos cinza no formato dos cards)
- **Sem resultados:** *"Nenhuma loja encontrada para '{busca}'."* + botão para limpar a busca
- **Erro de rede:** mensagem + botão "Tentar novamente"

## 7. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
componentes de UI seguindo Base UI + tailwind-variants + tailwind-merge. O componente
Pagination já existe em src/components/catalog/pagination.tsx e deve ser reaproveitado
(mesmo modo degradado, sem total de páginas). O placeholder de iniciais de logo (usado
quando logo_image_url vem vazio) já existe na implementação da Vitrine da Loja —
reaproveitar, não recriar.

Tarefa: implementar a tela de busca de lojas em src/app/(public)/lojas/page.tsx,
seguindo rigorosamente o documento "Spec: Buscar Lojas".

Requisitos:
- Campo de busca SEMPRE visível no topo (diferente do padrão de lupa expansível da
  Home) — busca por nome via GET /stores?name=&page=, com debounce de ~400ms,
  refletido na URL (?name=&page=)
- Grid de StoreCard: logo (ou placeholder de iniciais), nome, descrição truncada em
  1-2 linhas, link para /loja/[slug]
- Sem filtro de categoria — lojas não são categorizadas
- Paginação numérica reaproveitando o componente Pagination existente
- Adicionar um link "Lojas" no Header do site, apontando para /lojas (hoje não existe
  nenhum ponto de entrada para esta tela)
- Estados: loading (skeleton), sem resultados (mensagem + limpar busca), erro (com retry)
- Responsivo: 2 colunas mobile, 3-4 desktop

Atenção: o campo de logo desta rota vem como logo_image_url (não logo_url) — usar a
mesma função de fallback já criada para tratar essa inconsistência entre endpoints.

Toda chamada HTTP usa credentials: 'include'.

Não implementar: filtro por categoria de loja (não existe), ordenação customizada —
fora do escopo desta tela.
```