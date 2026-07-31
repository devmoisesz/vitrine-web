# Vitrine Web — Spec: Painel do Lojista (Colaborador) — Arquitetura + Dashboard

## 1. Contexto

Área autenticada exclusiva para usuários com `role` `"Funcionário"` ou `"Proprietário"`.
Diferente do Admin (que gerencia toda a plataforma), o painel do lojista gerencia **uma
loja só** — a loja à qual o colaborador está vinculado.

Rota base: `/painel` — **sem slug na URL** (decisão registrada abaixo). O slug da loja é
resolvido internamente via `GET /me` (`store_slug`).

## 2. Middleware de Proteção (`src/middleware.ts`)

Mesma lógica já usada para `/admin` (decodifica o `refreshToken` já existente, sem cookie
novo), só muda a condição de papel aceito:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, importSPKI } from 'jose';

const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!;
const COLLABORATOR_ROLES = ['Funcionário', 'Proprietário'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isPainelRoute = pathname.startsWith('/painel');

  if (!isAdminRoute && !isPainelRoute) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
  }

  try {
    const key = await importSPKI(PUBLIC_KEY, 'RS256');
    const { payload } = await jwtVerify(refreshToken, key);

    if (isAdminRoute && payload.role !== 'Admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (isPainelRoute && !COLLABORATOR_ROLES.includes(payload.role as string)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/painel/:path*'],
};
```

Unifiquei num só `middleware.ts` (o Next.js só permite um arquivo de middleware por
projeto) — se o arquivo do Admin já existir separado, mesclar essa lógica nele em vez de
criar um segundo.

**Importante:** o middleware só garante o papel **amplo** (`Funcionário`/`Proprietário`).
A distinção entre o que cada um pode fazer dentro do painel (ex: só `Proprietário` cadastra
funcionários) é resolvida **client-side**, lendo `user_role` do `GET /me` — e o backend
já reforça isso de qualquer forma via `@RequireRoles(...)` em cada rota sensível, então
mesmo que a UI errasse, a API protege.

## 3. Decisão de Rota: sem slug na URL

`/painel` em vez de `/loja/[slug]/painel`. Motivo: o colaborador só acessa a própria loja
— não há cenário de compartilhar esse link ou trocar de loja pela URL. Menos uma camada
de validação (slug da URL vs. loja do usuário logado) sem necessidade real.

## 4. ⚠️ Gaps de Backend Registrados

### `store_slug` no `GET /me`
Confirmado que será adicionado — necessário para todas as chamadas `/stores/:slug/...`
depois do login.

### Falta endpoint para listar produtos da loja incluindo inativos
Todas as listagens de produto documentadas (`GET /products`, `GET /store/:slug/products`)
são **públicas e só retornam produtos `ATIVO`** (regra de negócio: produto desativado não
aparece em nenhuma busca). O colaborador precisa ver **todos os status** para conseguir
reativar um produto desativado — isso não existe hoje.

**Sugestão:** adicionar uma rota dedicada de gestão, separada do namespace público:
```
GET /store/:slug/manage/products?status=&page=
Auth: JwtAuthGuard + StoreAccessGuard, roles: FUNCIONARIO|PROPRIETARIO
Resposta: mesma estrutura de Product, mas incluindo produtos ATIVO e INATIVO
```
Isso também resolve a métrica de "produtos ativos" do dashboard (contando localmente ou
via `X-Total-Count`, mesmo padrão já pedido em outras rotas).

**Importante — são dois endpoints separados, para públicos diferentes, nenhum substitui
o outro:**

| Endpoint | Usado por | Retorna |
|---|---|---|
| `GET /store/:slug/products` (já existe) | Vitrine da Loja (pública) | Só `ATIVO` |
| `GET /store/:slug/manage/products` (**novo**) | Painel do Lojista → Produtos | `ATIVO` + `INATIVO` |

O Painel do Lojista **não usa** o endpoint da Vitrine da Loja — precisa enxergar produtos
desativados para poder reativá-los, o que não faz sentido expor num endpoint público. No
frontend, isso vira dois fetchers/hooks completamente separados, sem reaproveitamento de
lógica além do tipo `Product` em comum.

### Inconsistência: `POST /stores/:storeId/collaborators` usa ID, não slug

Praticamente toda rota de gestão da loja usa `:slug` na URL — essa é a única exceção,
usando `:storeId` (UUID). Consequência prática: `GET /me` precisa retornar **também**
`store_id`, não só `store_slug`, só por causa dessa rota específica. Vale considerar
padronizar essa rota para aceitar `:slug` como as demais, evitando ter que expor os dois
identificadores só por essa exceção.

utilize /stores/:slug/collaborators eu vou fazer essa mudança na api.

## 5. Layout do Painel (`src/app/painel/layout.tsx`)

```
┌───────────┬────────────────────────────────────┐
│  Loja      │  Dashboard                          │
│  Exemplo   │                                     │
│  (painel)  │  [conteúdo da página atual]          │
├───────────┤                                     │
│ Dashboard  │                                     │
│ Produtos   │                                     │
│ Pedidos    │                                     │
│ Funcionários│ ← só visível se user_role === 'Proprietário'│
│ Dados da loja│                                    │
├───────────┤                                     │
│ Sair       │                                     │
└───────────┴────────────────────────────────────┘
```
- Mesmo padrão do Admin: sidebar própria, mesmos tokens de cor/fonte, **sem** reaproveitar
  o `Header` do consumidor
- Item "Funcionários" só aparece na sidebar se `user_role === 'Proprietário'`

## 6. Contrato de API (dashboard)

```
GET /me
(já retorna store_name, store_address, store_slug após o ajuste — usado para o cabeçalho
da sidebar mostrar o nome da loja)
```

```
GET /store/:slug/orders?page=
Auth: JwtAuthGuard + StoreAccessGuard, roles: FUNCIONARIO|PROPRIETARIO
(mesma estrutura de GET /orders — usado para "últimos pedidos recebidos")
```

```
GET /stores/:slug/products?status=&page=   [endpoint novo, ver seção 4]
(usado para a métrica de produtos ativos)
```

## 7. Conteúdo do Dashboard

### Visão geral (métricas, topo da página)
Cards simples com números:
- **Produtos ativos** — contagem via o endpoint novo (seção 4), filtrando `status=ATIVO`
- **Pedidos recebidos** — contagem dos pedidos retornados (ou `X-Total-Count`, quando existir)

### Atalhos diretos
- **"+ Cadastrar produto"** → `/painel/produtos/novo` (tela futura)
- **"Ver produtos"** → `/painel/produtos` (tela futura)

### Últimos pedidos recebidos
- Tabela: data, valor total, (sem nome do cliente disponível ainda — mesma limitação já
  vista no histórico de pedidos do cliente, `GET /store/:slug/orders` provavelmente segue
  o mesmo formato enxuto de `GET /orders`, sem dados de usuário embutidos — confirmar)
- Link "Ver todos" → `/painel/pedidos` (tela futura)

## 8. Estados

- Loading: skeleton dos cards de métrica + tabela
- Erro: mensagem + botão "Tentar novamente"
- Sem pedidos ainda: "Nenhum pedido recebido ainda."

## 9. Componentes

```
app/painel/
├── layout.tsx
└── page.tsx

components/painel/
├── painel-sidebar.tsx          # com item "Funcionários" condicional
├── metric-card.tsx
├── painel-shortcut-card.tsx
└── recent-store-orders-table.tsx

features/painel/hooks/
├── use-store-metrics.ts
└── use-recent-store-orders.ts
```

## 10. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
componentes de UI seguindo Base UI + tailwind-variants + tailwind-merge (Button, Badge
já existem em src/components/ui/). O middleware de proteção de rotas já cobre /painel/*
(ver seção 2 do documento "Painel do Lojista — Arquitetura + Dashboard") — se o
middleware do Admin já existir separado, mesclar a lógica nele, não duplicar o arquivo.

Tarefa: implementar o layout e dashboard do painel do lojista:
1. src/app/painel/layout.tsx — sidebar de navegação (Dashboard, Produtos, Pedidos,
   Funcionários [só se user_role === 'Proprietário', vindo de GET /me], Dados da loja,
   Sair), SEM reaproveitar o Header do consumidor
2. src/app/painel/page.tsx — dashboard principal

Dashboard deve conter:
- Cards de métrica no topo: produtos ativos e total de pedidos recebidos
- Dois atalhos: "+ Cadastrar produto" (link para /painel/produtos/novo) e "Ver produtos"
  (link para /painel/produtos) — rotas ainda não existem, só criar os links
- Tabela "Últimos pedidos recebidos" via GET /store/:slug/orders?page=1 (o slug vem de
  GET /me, campo store_slug) + link "Ver todos" para /painel/pedidos
- Estados: loading (skeleton), erro (com retry), vazio ("Nenhum pedido recebido ainda.")

Sidebar: mesmos tokens de cor/fonte do projeto, composição própria (sidebar + conteúdo).
Item "Sair" chama POST /logout e redireciona para /login.

Toda chamada HTTP usa credentials: 'include'.

Não implementar ainda: telas de /painel/produtos, /painel/produtos/novo, /painel/pedidos,
/painel/funcionarios, /painel/loja (dados da loja) — só os links partindo do dashboard e
da sidebar, o conteúdo dessas rotas vem em specs futuras.
```

## 11. Todas as Rotas Disponíveis para Colaboradores

Referência completa — usar conforme cada tela futura do painel for especificada.

### Loja (dados gerais)
```
PUT /store/:slug/edit
Auth: PROPRIETARIO
Body: { newName, newEmail, newDescription }
Resposta: 204
```

### Produtos
```
POST /stores/:slug/products
Auth: FUNCIONARIO|PROPRIETARIO
Body: { name_product, tags, description, price, sizes, stock, name_category, name_subcategory }
Resposta: 201, retorna o id do produto criado (string)

⚠️ Repare: usa name_category/name_subcategory (nomes, não IDs) — diferente do padrão
por ID usado nos filtros públicos. Confirmar se o backend resolve o nome para o
categoryId/subcategoryId internamente, ou se é um formato intencionalmente diferente.

PUT /stores/:slug/products/:productId
Auth: FUNCIONARIO|PROPRIETARIO
Body: campos editados
Resposta: 204

DELETE /stores/:slug/products/:productId/
Auth: FUNCIONARIO|PROPRIETARIO
Resposta: 204

PATCH /stores/:slug/products/:productId/status
Auth: FUNCIONARIO|PROPRIETARIO
Body: { status: "ATIVO" | "INATIVO" }
Resposta: 204

GET /store/:slug/manage/products?status=&page=   [NOVO — ver seção 4]
Auth: FUNCIONARIO|PROPRIETARIO
Resposta: Product[], incluindo ATIVO e INATIVO
```

### Imagens de Produto
```
POST /stores/:slug/productimages/:productId
Auth: FUNCIONARIO|PROPRIETARIO
FormFile: file. Body opcional: is_main
Resposta: 201 (ProductImage criada)

PATCH /stores/:slug/productimages/:productId/:imageId
Auth: FUNCIONARIO|PROPRIETARIO
FormFile: file
Resposta: 200 (imagem atualizada)

PATCH /stores/:slug/productimages/:productId/:imageId/set-main
Auth: FUNCIONARIO|PROPRIETARIO
Resposta: 204

DELETE /stores/:slug/productimages/:productId/:imageId?newMainId=
Auth: FUNCIONARIO|PROPRIETARIO
Resposta: 204
```

### Pedidos da Loja
```
GET /store/:slug/orders?page=
Auth: FUNCIONARIO|PROPRIETARIO
Resposta: mesma estrutura de GET /orders (id, userId, storeId, total, createdAt)
```

### Logo da Loja
```
POST /stores/:slug/logo
Auth: PROPRIETARIO
FormFile: file
Resposta: 201

PATCH /stores/:slug/logo/change
Auth: PROPRIETARIO
FormFile: file
Resposta: 200

DELETE /stores/:slug/logo/delete
Auth: PROPRIETARIO
Resposta: 204
```

### Colaboradores / Funcionários (só Proprietário)
```
POST /stores/:storeId/collaborators   ⚠️ usa :storeId (UUID), não :slug — ver nota na seção 4
Auth: PROPRIETARIO
Body: { name, email, password, role }
Resposta: 201

GET /store/:slug/employees?page=
Auth: PROPRIETARIO
Resposta (200): [{ name, email }]
⚠️ Retorno bem enxuto — sem id do colaborador. Se a tela precisar de um botão "remover"
por linha, vai precisar de um id nessa resposta (o DELETE abaixo pede employeeId).

DELETE /store/:slug/delete/:employeeId
Auth: PROPRIETARIO
Resposta: 204
```

### Endereço da Loja (só Proprietário)
```
POST /address/:slug/register/
Auth: PROPRIETARIO
Body: { label, cep, state, city, neighborhood, street, number, complement }
Resposta: 201

PUT /store/:slug/address
Auth: PROPRIETARIO
Body: { cep, state, city, neighborhood, street, number, complement }
Resposta: 204
```

## 12. Gaps Adicionais Identificados Nesta Revisão

1. **`GET /store/:slug/employees` não retorna o `id` do colaborador** — só `name` e
   `email`. A tela de listagem de funcionários precisa desse id para o botão de remover
   (`DELETE /store/:slug/delete/:employeeId`) funcionar. Precisa incluir `id` na resposta.
2. **`POST /stores/:storeId/collaborators` usa `:storeId`, não `:slug`** — inconsistente
   com o resto da API (ver seção 4). Ou padroniza para `:slug`, ou o frontend guarda os
   dois identificadores desde o login.