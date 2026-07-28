# Vitrine Web — Spec: Home / Catálogo Geral

## 1. Contexto

Rota: `src/app/(public)/page.tsx`. Página de entrada do marketplace — catálogo unificado
de todas as lojas. Acesso público, sem autenticação necessária.

## 2. Layout Geral

### Desktop
```
┌──────────────────────────────────────────────────────────┐
│  [Logo Vitrine Web]              [🔍]     [👤]      [🛒 3]    │  <- Header
├───────────────┬────────────────────────────────────────────┤
│ Categorias     │  [Produto] [Produto] [Produto] [Produto]   │
│  ▸ Feminino    │  [Produto] [Produto] [Produto] [Produto]   │
│  ▸ Masculino   │  [Produto] [Produto] [Produto] [Produto]   │
│  ▸ Infantil    │  ...                                        │
│  ▸ Acessórios  │                                              │
│                │  «  1  2  3  4  5  »                        │  <- Paginação
└───────────────┴────────────────────────────────────────────┘
```
Sidebar fixa à esquerda (largura ~240px), grid de produtos ocupando o resto.

### Mobile
```
┌──────────────────────────────┐
│ [Logo]         [🔍]   [🛒 3] │  <- Header
├──────────────────────────────┤
│ [Feminino][Masculino][Infant.]│  <- Chips horizontais roláveis
├──────────────────────────────┤
│  [Produto]      [Produto]     │  <- Grid 2 colunas
│  [Produto]      [Produto]     │
│  ...                          │
│     «  1  2  3  »             │
└──────────────────────────────┘
```
Sidebar vira chips horizontais roláveis (sem scroll vertical de menu), grid 2 colunas.

## 3. Componentes

```
components/
├── layout/
│   └── header.tsx                 # Logo + busca expansível + carrinho com badge
├── catalog/
│   ├── category-sidebar.tsx        # Desktop — accordion categoria > subcategorias
│   ├── category-chips.tsx          # Mobile — chips horizontais roláveis
│   ├── product-grid.tsx            # Grid responsivo de ProductCard
│   └── pagination.tsx              # Paginação numérica
└── product/
    └── product-card.tsx            # Card individual (já usado em outras telas também)

features/catalog/
├── hooks/
│   ├── use-products.ts             # useQuery — busca produtos com filtros ativos
│   └── use-categories.ts           # useQuery — categorias + subcategorias (cache longo)
└── api/
    ├── fetch-products.ts
    └── fetch-categories.ts
```

## 4. Contrato de API

```
GET /products?page=&category=&subcategory=&search=
Resposta: { data: Product[], total: number, page: number, totalPages: number }
(40 itens por página — parâmetro fixo do backend, não configurável pelo front)

GET /categories
Resposta: Category[] com subcategorias aninhadas (usado tanto no sidebar quanto nos chips)
```

Cada `Product` já vem com `store` embutido (nome, slug, logo) — não é necessário request
adicional para exibir a loja no card.

## 5. Gerenciamento de Estado / URL

Estado de filtro **sempre refletido na URL**, nunca só em estado local — permite
compartilhar link, voltar/avançar no navegador, e manter indexação por categoria no Google:

```
/?categoria=feminino&subcategoria=vestidos&busca=floral&page=2
```

- Página inicial (Server Component): lê `searchParams`, faz o fetch inicial no servidor
  (bom para SEO e primeiro carregamento) e passa como dado inicial para o componente cliente
- Interações subsequentes (trocar página, categoria, busca): atualizam a URL via
  `router.push` (Next.js App Router), o que já dispara novo fetch — usar TanStack Query
  com a URL/params como `queryKey` para cache e evitar refetch desnecessário ao voltar

## 6. Comportamento do Header

### Logo
- Sempre visível, à esquerda, link para `/` (limpa todos os filtros)

### Busca (lupa expansível)
1. Estado padrão: ícone de lupa
2. Ao clicar: expande um input inline no lugar do ícone (animação simples de largura),
   foco automático no input, ícone "X" para fechar
3. Digitação com debounce de ~400ms antes de disparar a busca (evita uma request por
   tecla)
4. Busca **combina com a categoria/subcategoria ativas** — todos os filtros coexistem na
   URL simultaneamente
5. Ao fechar (X ou clicar fora), se o campo estiver vazio, volta ao ícone de lupa; se
   tiver texto, mantém expandido com o texto (fechar não deve perder a busca ativa sem
   ação explícita de limpar)

### Carrinho
- Ícone com badge numérico = soma de `cart_items` de **todos** os carrinhos do usuário
- Clique redireciona para `/carrinhos`
- Se usuário não autenticado: redireciona para `/login` (não faz sentido mostrar carrinho
  vazio pra quem nunca logou)

## 7. Comportamento das Categorias

- **Seleção única por vez** (não multi-select) — reflete a estrutura de filtro do backend
  (`category` + `subcategory` como valores únicos na query, não arrays)
- **Desktop (sidebar):** lista de categorias principais; ao clicar em uma, expande em
  accordion as subcategorias abaixo dela (sem navegar, mesma página). Clicar de novo
  recolhe. Subcategoria selecionada fica destacada (peso de fonte, não cor)
- **Mobile (chips):** categorias principais como chips horizontais roláveis. Ao selecionar
  uma, uma segunda linha de chips aparece abaixo com as subcategorias daquela categoria
- Limpar filtro de categoria: um chip/botão "Todas" sempre presente como primeira opção

## 8. Grid de Produtos

- Desktop: 3–4 colunas (responsivo por breakpoint)
- Mobile: 2 colunas
- Cada `ProductCard` exibe: imagem principal (`is_main`), nome, preço, nome/logo da loja,
  badge sutil se produto sem estoque (desabilita clique de "adicionar ao carrinho" mas
  ainda permite ver detalhes)

## 9. Paginação

- Numérica tradicional, refletida em `?page=N`
- Ao trocar de página, rolar suavemente para o topo do grid (não do topo absoluto da
  página, para não perder contexto do header/filtros)
- Desabilitar botões "anterior"/"próxima" nos limites (página 1 e última página)

## 10. Estados

- **Loading inicial:** skeleton do grid (retângulos cinza no formato dos cards)
- **Sem resultados** (busca ou filtro sem produtos): mensagem centralizada, tipografia
  simples, sem ilustração pesada — ex: *"Nenhum produto encontrado para 'floral' em
  Vestidos."* + botão para limpar filtros
- **Erro de rede:** mensagem de erro com botão "Tentar novamente"

## 11. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css (@theme). Stack:
TanStack Query para data fetching, componentes de UI seguindo o padrão Base UI +
tailwind-variants + tailwind-merge já estabelecido no projeto (Button, Input, Badge
já existem em src/components/ui/).

Tarefa: implementar a Home / Catálogo geral em src/app/(public)/page.tsx, seguindo
rigorosamente o documento "Spec: Home / Catálogo Geral" (todas as seções).

Pontos críticos a não deixar de fora:
- Filtros de categoria, subcategoria, busca e página SEMPRE refletidos na URL via
  searchParams — nunca apenas em estado local do React
- Fetch inicial no Server Component (lendo searchParams), hidratando o client component
  que usa TanStack Query para as interações seguintes
- Header: logo à esquerda, busca expansível inline com debounce de ~400ms, carrinho
  com badge somando itens de todos os carrinhos
- Desktop: sidebar de categorias com accordion de subcategorias
- Mobile: chips horizontais roláveis substituindo a sidebar (breakpoint a definir
  conforme o restante do projeto, sugestão: < 768px)
- Paginação numérica (não infinita), scroll suave até o topo do grid ao trocar página
- Estados de loading (skeleton), vazio e erro conforme seção 10

Não implementar: filtro multi-select de categoria, ordenação customizada — fora do
escopo desta tela por ora.
```
