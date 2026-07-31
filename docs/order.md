# Vitrine Web — Spec: Pedidos da Loja (Painel do Lojista)

## 1. Contexto

Duas rotas:
- `src/app/painel/pedidos/page.tsx` — listagem completa
- `src/app/painel/pedidos/[orderId]/page.tsx` — detalhe (ver gap crítico na seção 3)

Acessível por `Funcionário` e `Proprietário` (visualização de pedidos não é restrita ao
dono, diferente de Funcionários/Dados da Loja).

**Importante sobre o propósito desta tela:** a comunicação real do pedido já aconteceu
via WhatsApp no momento em que o cliente finalizou a compra — a loja já recebeu a
mensagem com nome do cliente, itens, endereço, etc. **Esta tela é um registro/histórico
para controle interno da loja**, não o canal operacional de atendimento do pedido.

## 2. Contrato de API

```
GET /store/:slug/orders?page=
Auth: JwtAuthGuard + StoreAccessGuard, roles: FUNCIONARIO|PROPRIETARIO
Resposta 200:
[
  {
    "id": "uuid",
    "userId": "uuid",
    "storeId": "uuid",
    "total": "348.95",
    "createdAt": "2026-07-25T00:59:58.590Z"
  }
]
```
Mesma limitação já conhecida: sem `userId` resolvido para nome do cliente, sem total de
páginas. Reaproveitar o componente `Pagination` (modo degradado).

## 3. Correção de Backend Necessária Antes desta Tela

O `GET /orders/:orderId` (usado no histórico do cliente) hoje **não verifica autorização
nenhuma além de "o pedido existe"** — qualquer usuário autenticado consegue ver qualquer
pedido, e colaboradores da loja também não estão explicitamente autorizados. Isso é uma
falha de segurança, registrada com prioridade crítica no documento de pendências da API,
com a correção exata a aplicar no `ListOrderProductsService`.

**Depois dessa correção**, o mesmo endpoint passa a aceitar tanto o dono do pedido quanto
um colaborador da loja à qual o pedido pertence — então a tela de detalhe deste documento
(seção 5) pode ser implementada normalmente, reaproveitando `GET /orders/:orderId`, sem
precisar de uma rota nova dedicada ao painel do lojista.

## 4. Tela de Listagem (`/painel/pedidos`)

- Tabela: **data** formatada, **valor total** (BRL), link "Ver detalhes" → `/painel/pedidos/:orderId`
- Sem nome do cliente na listagem (API não retorna) — mesma limitação já aceita no
  histórico de pedidos do cliente
- Paginação: reaproveitar `Pagination` (modo degradado)

### Estados
- Loading: skeleton de linhas de tabela
- Vazio: "Nenhum pedido recebido ainda."
- Erro: mensagem + botão "Tentar novamente"

## 5. Tela de Detalhe (`/painel/pedidos/:orderId`)

Reaproveita `GET /orders/:orderId` (mesmo endpoint do histórico do cliente, agora
autorizado também para colaboradores da loja após a correção da seção 3):
- Cabeçalho: data + valor total
- Lista de itens: imagem principal do produto, nome, tamanho selecionado (se houver),
  quantidade, preço unitário
- Sem ações (mesma decisão já tomada no histórico do cliente — só visualização)

## 6. Componentes

```
app/painel/pedidos/
├── page.tsx
└── [orderId]/page.tsx

components/painel/
├── store-orders-table.tsx
└── order-item-row.tsx     # pode reaproveitar o mesmo componente já criado para o
                             # histórico de pedidos do cliente, se o formato bater

features/painel/hooks/
├── use-store-orders.ts        # GET /store/:slug/orders
└── use-store-order-detail.ts   # GET /orders/:orderId (reaproveitado)
```

## 7. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
componentes de UI seguindo Base UI + tailwind-variants + tailwind-merge. O componente
Pagination já existe em src/components/catalog/pagination.tsx — reaproveitar.

Tarefa: implementar as duas telas de pedidos da loja, seguindo rigorosamente o
documento "Spec: Pedidos da Loja (Painel do Lojista)":
1. src/app/painel/pedidos/page.tsx — listagem
2. src/app/painel/pedidos/[orderId]/page.tsx — detalhe

Listagem (GET /store/:slug/orders?page=):
- Tabela: data formatada, valor total (BRL), link "Ver detalhes" para
  /painel/pedidos/:orderId
- NÃO exibir nome do cliente — a API não retorna esse dado nesta rota
- Reaproveitar o componente Pagination existente (modo degradado, sem total de páginas)
- Estados: loading (skeleton), vazio ("Nenhum pedido recebido ainda."), erro (com retry)

Detalhe (GET /orders/:orderId — mesmo endpoint já usado no histórico do cliente, agora
também autorizado para colaboradores da loja):
- Cabeçalho com data e total
- Lista de itens: imagem principal do produto, nome, tamanho selecionado (se houver),
  quantidade, preço unitário
- Sem ações — só visualização
- Estados: loading (skeleton), erro/não encontrado (com botão para voltar à listagem)

Toda chamada HTTP usa credentials: 'include'.

Não implementar: reenvio de mensagem, alteração de status do pedido — fora do escopo.
```