# 🛍️ Vitrine Web — Frontend

Marketplace de **vitrine digital** para lojas de roupas de cidades pequenas, funcionando como um catálogo unificado onde **clientes navegam livremente, montam carrinhos por loja e finalizam a compra via WhatsApp**.

A negociação de pagamento e entrega acontece **fora da plataforma** (direto no WhatsApp do lojista). O acesso ao catálogo é **público** — a autenticação só é exigida para interagir com carrinho, pedidos, perfil e áreas administrativas.

> Este repositório contém apenas o **frontend**. A API (NestJS + Prisma + PostgreSQL) é consumida de forma remota — veja a seção [API](#-api) e a documentação em [`docs/`](#-documentação-técnica).

---

## 📖 Índice

- [Visão geral](#-visão-geral)
- [Funcionalidades por papel](#-funcionalidades-por-papel)
- [Stack tecnológica](#️-stack-tecnológica)
- [Arquitetura e estrutura de pastas](#-arquitetura-e-estrutura-de-pastas)
- [Fluxo de ponta a ponta](#-fluxo-de-ponta-a-ponta)
- [Autenticação e autorização](#-autenticação-e-autorização)
- [API](#-api)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Como executar](#-como-executar)
- [Documentação técnica](#-documentação-técnica)
- [Status do projeto](#-status-do-projeto)

---

## 🚀 Visão geral

A **Vitrine Web** conecta três perfis de usuário em uma única plataforma:

| Papel            | O que faz                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cliente**      | Navega pelo catálogo global, busca produtos e lojas, filtra por categoria/subcategoria, adiciona itens ao carrinho (um por loja) e envia o pedido pelo WhatsApp. |
| **Funcionário**  | Gerencia produtos, imagens e pedidos da loja à qual está vinculado.                                                                                              |
| **Proprietário** | Tudo do Funcionário + gestão da loja (dados, logo, endereço, formas de pagamento/entrega) e cadastro de funcionários.                                            |
| **Admin**        | Cadastra e gerencia lojas, categorias e subcategorias da plataforma.                                                                                             |

### Regras de negócio centrais

- Um **carrinho ativo por loja** por cliente, criado automaticamente ao adicionar o primeiro produto daquela loja.
- Produtos só podem ser adicionados ao carrinho se houver **estoque** e se o produto/loja estiverem **ativos**.
- O pedido é **registrado na plataforma** e a negociação é **finalizada no WhatsApp** do lojista, com mensagem automática contendo cliente, itens, quantidades, tamanhos, total e endereço de entrega.
- Uma loja só pode ter **um endereço** cadastrado (diferente do perfil do cliente, que aceita múltiplos endereços).
- Produtos exigem **no mínimo 1 e no máximo 5 imagens** para serem publicados.

---

## 🧩 Funcionalidades por papel

### 👤 Cliente

- Cadastro e login (e-mail/senha ou Google).
- Catálogo global com busca por nome, filtro por categoria/subcategoria e paginação (40 itens/página).
- Página de vitrine exclusiva de cada loja, com dados, endereço e filtro de produtos da loja.
- Página de detalhes do produto com galeria de imagens, seletor de tamanho, quantidade e disponibilidade.
- Carrinhos separados por loja, com alteração de quantidade/tamanho e remoção de itens.
- Checkout por loja: seleção de endereço (de múltiplos cadastrados), edição da mensagem e envio via WhatsApp com registro do pedido.
- Histórico de pedidos enviados e perfil completo (dados pessoais, endereços, troca de senha).

### 🧑‍💼 Funcionário

- Cadastrar, editar, desativar/ativar e remover produtos da própria loja.
- Gerenciar imagens dos produtos (upload, troca, remoção e definição de imagem principal).
- Visualizar o histórico de pedidos recebidos pela loja e o detalhe de cada pedido.

### 👑 Proprietário

- Tudo do Funcionário.
- Editar dados gerais da loja (nome, e-mail, WhatsApp, descrição).
- Configurar formas de **pagamento** (`PIX`, `DINHEIRO`, `CARTAO_ENTREGA`, `CARTAO_ONLINE`) e **entrega** (`RETIRADA_LOJA`, `ENTREGA_PROPRIA`, `CORREIOS`, `MOTOBOY`).
- Enviar, trocar e remover a **logo** da loja.
- Cadastrar e remover **funcionários** vinculados à loja.
- Cadastrar e editar o **endereço** da loja.

### 🛠️ Admin

- Dashboard com atalhos e lojas recentes.
- Cadastrar lojas (incluindo o dono vinculado) e ativar/desativar lojas.
- Cadastrar e editar **categorias** e **subcategorias**.

---

## 🛠️ Stack tecnológica

### Frontend (este repositório)

| Camada          | Tecnologia                                                         |
| --------------- | ------------------------------------------------------------------ |
| Framework       | **Next.js 16** (App Router, RSC + Server Actions/Route Handlers)   |
| UI              | **React 19** + TypeScript (strict)                                 |
| Estilos         | **Tailwind CSS v4**, `tailwind-variants`, `tailwind-merge`         |
| Componentes     | **Base UI** (`@base-ui/react`), `lucide-react` (ícones)            |
| Estado servidor | **TanStack Query** (React Query v5)                                |
| Formulários     | **React Hook Form** + **Zod**                                      |
| Estado global   | **Zustand**                                                        |
| Animações       | **Framer Motion**                                                  |
| Notificações    | **sonner** (toasts)                                                |
| Autenticação    | **jose** (verificação JWT RS256 no middleware)                     |
| Fontes          | **Auto-hospedadas** (`next/font/local` — Bodoni Moda, Inter, Lato) |

### Backend (API externa)

- **NestJS** (TypeScript)
- **Prisma ORM** + **PostgreSQL**
- **JWT** (algoritmo **RS256**) com `access_token` (15 min) e `refresh_token` (1 h)
- **bcrypt** para hash de senha
- **Cloudinary** para armazenamento de imagens
- **Google OAuth** (login social)
- **ViaCEP** (autopreenchimento de endereços)

---

## 📁 Arquitetura e estrutura de pastas

O projeto usa **App Router** do Next.js com organização por **features** e **componentes reutilizáveis**:

```
src/
├── app/                      # Rotas do Next.js (App Router)
│   ├── (public)/             # Área pública
│   │   ├── page.tsx          # Catálogo global (busca, filtros, paginação)
│   │   ├── lojas/            # Busca de lojas
│   │   ├── loja/[slug]/      # Vitrine exclusiva de uma loja
│   │   └── produto/[productId]/  # Detalhes do produto
│   ├── (auth)/               # Autenticação
│   │   ├── login/            # Login (e-mail/senha + Google)
│   │   └── cadastro/         # Criação de conta
│   ├── (account)/            # Área do cliente (autenticada)
│   │   ├── carrinho/         # Lista de carrinhos por loja
│   │   ├── carrinhos/[cartId]/checkout/  # Finalizar pedido via WhatsApp
│   │   ├── pedidos/          # Histórico de pedidos do cliente
│   │   └── perfil/           # Dados pessoais, endereços, senha
│   ├── admin/                # Painel do Admin (protegido por middleware)
│   │   ├── lojas/            # Lista/cadastro de lojas
│   │   └── categorias/       # Categorias e subcategorias
│   ├── painel/               # Painel do lojista (Funcionário/Proprietário)
│   │   ├── produtos/         # Lista, cadastro, edição e imagens de produtos
│   │   ├── pedidos/          # Pedidos recebidos pela loja
│   │   ├── loja/             # Dados da loja, pagamento/entrega, logo, endereço
│   │   └── funcionarios/     # Gestão de funcionários (só Proprietário)
│   └── api/session/          # Route Handlers (proxy de sessão: login, google, refresh, logout)
│
├── components/               # Componentes de UI e de domínio reutilizáveis
│   ├── ui/                   # Botão, Input (Base UI + tailwind-variants)
│   ├── layout/               # Header global
│   ├── product/              # Card de produto, galeria, seletor de tamanho, etc.
│   ├── store/                # Vitrine da loja, busca, grid
│   ├── cart/                 # Itens e cards de carrinho
│   ├── checkout/             # Resumo, seletor de endereço, editor de mensagem
│   ├── orders/               # Cards e resumo de pedidos
│   ├── profile/              # Dados pessoais, endereços, senha
│   ├── admin/                # Sidebar, tabelas e formulários do Admin
│   └── painel/               # Sidebar, formulários e tabelas do lojista
│
├── features/                 # Lógica de domínio por módulo
│   ├── auth/                 # Sessão, login, registro, logout
│   ├── catalog/              # Catálogo, categorias, produtos, detalhes
│   ├── store/                # Perfil de loja, busca de lojas
│   ├── cart/                 # API e hooks de carrinho
│   ├── checkout/             # Criação de pedido + mensagem WhatsApp
│   ├── orders/               # Pedidos do cliente
│   ├── profile/              # Perfil, endereços, senha
│   ├── painel/               # Produtos, pedidos, loja, funcionários
│   └── admin/                # Lojas, categorias
│
├── lib/                      # Infraestrutura
│   ├── api-client.ts         # Cliente HTTP com auto-refresh em 401
│   ├── roles.ts              # Normalização de papéis e roteamento pós-login
│   ├── session-role.ts       # Resolução do papel efetivo via GET /me
│   └── whatsapp.ts           # Montagem da mensagem e link wa.me
│
├── styles/                   # CSS global (Tailwind v4)
├── types/                    # Tipos compartilhados (catálogo, loja, pedidos)
└── middleware.ts             # Proteção de rotas /admin e /painel (JWT RS256)
```

Cada feature concentra sua **API** (chamadas HTTP) e **hooks** (TanStack Query + mutations), mantendo as páginas enxutas e a lógica de domínio isolada.

---

## 🔄 Fluxo de ponta a ponta

### Cliente (compra)

```
1. Catálogo ("/")
   → navega, busca por nome, filtra por categoria/subcategoria, pagina 40/página

2. Loja ("/loja/:slug")
   → vitrine exclusiva com dados, endereço, WhatsApp e produtos da loja

3. Produto ("/produto/:productId")
   → galeria, preço, estoque, tamanho, quantidade

4. Carrinho ("/carrinho")
   → um carrinho por loja; adiciona/edita quantidade/tamanho, remove itens

5. Checkout ("/carrinhos/:cartId/checkout")
   → revisa itens, escolhe endereço, edita a mensagem
   → "Enviar no WhatsApp": registra o pedido na API (POST /cart/:cartId/order)
     e abre wa.me do lojista com a mensagem pronta

6. Histórico ("/pedidos")
   → acompanha todas as solicitações enviadas
```

### Lojista (gestão)

```
Painel ("/painel")  → apenas Funcionário/Proprietário

1. Produtos      → cadastrar (categoria/subcategoria encadeadas, tamanhos, tags),
                   gerenciar imagens (até 5, definir principal), ativar/desativar
2. Pedidos       → lista e detalhe dos pedidos recebidos pela loja
3. Dados da loja → (só Proprietário) dados gerais, pagamento/entrega, logo, endereço
4. Funcionários  → (só Proprietário) cadastrar/remover colaboradores
```

### Admin (plataforma)

```
Admin ("/admin") → apenas Admin

1. Lojas          → cadastrar loja + dono, ativar/desativar
2. Categorias     → cadastrar/editar categorias e subcategorias
```

---

## 🔐 Autenticação e autorização

O fluxo de sessão é gerenciado pelo frontend através de **Route Handlers em `/api/session`**, que fazem proxy para a API:

| Fluxo                                    | Como funciona                                                                                                                                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Login** (`/api/session/login`)         | POST `/authenticate` → guarda `access_token` em memória e `refresh_token` em cookie **httpOnly** (`SameSite=lax`, `Secure` em produção). Resolve o papel via `GET /me` e grava o cookie `userRole`. |
| **Login Google** (`/api/session/google`) | POST `/authenticate/google` com `id_token` do Google Identity Services → mesmo fluxo do login.                                                                                                      |
| **Refresh** (`/api/session/refresh`)     | Lê o cookie httpOnly e chama PATCH `/refresh` → renova `access_token` e mantém `userRole`. O `api-client` faz **auto-refresh em 401** com fila de requisições pendentes.                            |
| **Logout** (`/api/session/logout`)       | Chama POST `/logout`, limpa os cookies `refreshToken` e `userRole`, descarta o token em memória.                                                                                                    |

### Papéis e roteamento

- **`GET /me`** retorna o papel efetivo: `Cliente` | `Admin` | `Proprietário` | `Funcionário`.
- O cookie `userRole` (gravado no login/refresh a partir do `/me`, com fallback no claim `role` do JWT) orienta o redirecionamento pós-login e a proteção de rotas.
- `src/lib/roles.ts` normaliza papéis (minúsculas, sem acento) e mapeia o destino pós-login: **Admin → `/admin`**, **Proprietário/Funcionário → `/painel`**, **Cliente → `/`**.

### Middleware (`src/middleware.ts`)

- Protege `/admin/:path*` e `/painel/:path*`.
- Verifica o `refreshToken` (JWT **RS256** via chave pública) e o cookie `userRole`.
- `/admin` exige papel `admin`; `/painel` exige `funcionario`/`proprietario` (admin é redirecionado para `/admin`; cliente nunca acessa o painel).
- Sem sessão → redireciona para `/login?redirect=...`.

> A autorização **real** (guards `JwtAuthGuard`, `AdminAccessGuard`, `StoreAccessGuard`, `RequireRoles`) é aplicada no **backend**. O middleware e os checks client-side servem apenas para proteção de UI.

---

## 🔌 API

- **URL base:** `https://vitrine-web-api.onrender.com` (configurável via `NEXT_PUBLIC_API_URL`).
- **Padrão de chamadas:** `src/lib/api-client.ts` com `credentials: "include"`, header `Authorization: Bearer <access_token>` para rotas autenticadas e **auto-refresh em 401** (fila de requisições durante a renovação).

| Grupo              | Endpoints principais                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Autenticação       | `POST /authenticate`, `POST /authenticate/google`, `PATCH /refresh`, `POST /logout`                                                                                      |
| Perfil             | `GET /me`, `PUT /account/edit`, `PATCH /account/password`, endereços (`POST /address/register`, `GET /me/addresses`, `PUT /me/addressess/:addressId`)                    |
| Catálogo           | `GET /products`, `GET /products/:productId`, `GET /categories`, `GET /subcategories`                                                                                     |
| Lojas              | `GET /stores`, `GET /store/:slug`, `GET /store/:slug/products`                                                                                                           |
| Carrinho           | `POST /products/:productId/cart`, `GET /carts`, `GET /cart/:cartId/products`, `PUT /cart/:cartItemId`, `DELETE /cart/:cartItemId`                                        |
| Pedidos            | `POST /cart/:cartId/order`, `GET /orders`, `GET /orders/:orderId`                                                                                                        |
| Produtos (loja)    | `GET /store/:slug/manage/products`, `POST/PUT/DELETE /stores/:slug/products...`, imagens (`POST/PATCH/DELETE .../productimages...`)                                      |
| Loja (colaborador) | `PUT /store/:slug/edit`, logo (`POST/PATCH/DELETE /stores/:slug/logo...`), endereço, colaboradores (`POST /stores/:storeId/collaborators`, `GET /store/:slug/employees`) |
| Admin              | `POST /store`, `PATCH /stores/:slug/activate                                                                                                                             | deactivate`, `GET /stores/admin`, `POST/PUT /categories...` |

> Detalhes completos dos 50 endpoints (exemplos de payload e resposta) em [`docs/endpoints.md`](docs/endpoints.md).

---

## ⚙️ Variáveis de ambiente

| Variável                       | Obrigatória | Descrição                                                                                                     |
| ------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`          | ✅          | URL base da API (ex.: `https://vitrine-web-api.onrender.com`).                                                |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ❌          | Client ID do Google OAuth (habilita o login social).                                                          |
| `JWT_PUBLIC_KEY`               | ✅          | Chave pública RSA (PEM) usada pelo middleware para verificar o JWT. Pode ser base64 ou PEM com `\n` literais. |

---

## ▶️ Como executar

Pré-requisitos: **Node.js 20+** e npm.

```bash
# Instalar dependências
npm install

# Ambiente de desenvolvimento (http://localhost:3000)
npm run dev

# Build de produção
npm run build

# Servir o build de produção
npm start

# Lint
npm run lint
```

---

## 📚 Documentação técnica

O repositório mantém specs e guias em [`docs/`](docs/):

| Documento                                                          | Conteúdo                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------ |
| [`docs/requirements.md`](docs/requirements.md)                     | Requisitos funcionais, regras de negócio e não funcionais.   |
| [`docs/endpoints.md`](docs/endpoints.md)                           | Lista completa dos 50 endpoints da API.                      |
| [`docs/authentication.md`](docs/authentication.md)                 | Regras de autenticação, tokens, cookies e guards do backend. |
| [`docs/spec.md`](docs/spec.md)                                     | Spec da tela "Dados da Loja + Logo" (painel do lojista).     |
| [`docs/tela-uplaod-de-imagens.md`](docs/tela-uplaod-de-imagens.md) | Spec de gestão de imagens de produto.                        |
| [`docs/componente-cart.md`](docs/componente-cart.md)               | Guia de UI/UX da tela de múltiplos carrinhos.                |


---

## ✅ Status do projeto

- ✅ Catálogo público com busca, filtros e paginação
- ✅ Autenticação por e-mail/senha **e** Google (JWT + refresh token httpOnly)
- ✅ Perfil do cliente com múltiplos endereços e troca de senha
- ✅ Carrinhos por loja e checkout via WhatsApp com registro de pedido
- ✅ Painel do lojista: produtos, imagens, pedidos, dados da loja, logo, funcionários
- ✅ Admin: lojas, categorias e subcategorias
- ✅ Proteção de rotas por papel (middleware + backend)
