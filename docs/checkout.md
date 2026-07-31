# Vitrine Web — Spec: Checkout / Solicitar Pedido via WhatsApp

## 1. Contexto

Rota: `src/app/(account)/carrinhos/[cartId]/checkout/page.tsx`. Acessada a partir do
botão "Finalizar pedido" em um card de carrinho (tela de Carrinhos, já implementada).
Área autenticada.

Esta é a tela que fecha o ciclo de compra: revisão dos itens de **um carrinho específico**
(de uma loja só), montagem de uma mensagem pré-formatada e editável, registro do pedido,
e redirecionamento para o WhatsApp da loja.

## 2. Contrato de API

```
GET /carts
Auth: JwtAuthGuard
(já usado na tela de Carrinhos — aqui, filtrar pelo cartId da rota para pegar os dados
do carrinho específico sendo finalizado; não existe GET /carts/:cartId dedicado)
```

```
GET /me
Auth: JwtAuthGuard
(para o nome do cliente na mensagem — user_name)
```

```
GET /me/addresses?page=
Auth: JwtAuthGuard
(para o seletor de endereço)
```

```
POST /cart/:cartId/order
Auth: JwtAuthGuard
Body: nenhum — o backend deriva tudo do carrinho existente pelo cartId
Resposta: 201, sem corpo

⚠️ Não retorna o id do pedido criado. Após o sucesso, redirecionar para /pedidos
(listagem), não para /pedidos/:orderId (não temos o ID).

⚠️ O carrinho é limpo automaticamente pelo backend após o pedido — o frontend não
precisa (e não deve tentar) remover os itens manualmente. Só invalidar a query de
carrinhos (['carts']) no React Query para refletir isso na próxima vez que a lista for
exibida.
```

## 3. Regras de Negócio

- **Mensagem estruturada, mas sempre editável** — pré-montada a partir dos dados reais,
  mas o cliente pode alterar o texto livremente antes de enviar
- **Editar a mensagem não altera o pedido registrado.** O `POST /cart/:cartId/order` não
  aceita nenhum corpo — o que é enviado ao WhatsApp é só texto; o que é registrado no
  banco é sempre o conteúdo real do carrinho. Exibir um aviso sutil sobre isso perto do
  campo de mensagem (ex: *"Este texto é apenas a mensagem enviada no WhatsApp — os itens
  do pedido são sempre os do seu carrinho."*)
- **Endereço:** se o cliente tiver mais de um cadastrado, exibir um seletor (radio) antes
  da mensagem. Se não tiver nenhum, omitir a seção de endereço da mensagem (sem bloquear
  o checkout — endereço não é obrigatório para o requisito, só "incluído automaticamente
  se houver")
- **Ordem de operações ao confirmar:**
  1. `POST /cart/:cartId/order`
  2. Se sucesso (2xx): abrir `wa.me/{whatsapp}?text={mensagem}` em nova aba, invalidar
     cache de carrinhos, mostrar confirmação, redirecionar para `/pedidos`
  3. Se erro: **não abrir o WhatsApp**, mostrar mensagem de erro, manter o cliente na
     tela para tentar de novo (evita registrar/enviar de forma inconsistente)

## 4. Montagem da Mensagem (template)

```typescript
function buildWhatsAppMessage({
  customerName,
  items,
  address,
  paymentMethods,
  deliveryMethods,
}: {
  customerName: string;
  items: { name: string; quantity: number; selectedSize: string | null; price: string }[];
  address: Address | null;
  paymentMethods: string[];
  deliveryMethods: string[];
}) {
  const itemsList = items
    .map((item) => {
      const sizeLabel = item.selectedSize ? ` (Tamanho: ${item.selectedSize})` : '';
      return `- ${item.quantity}x ${item.name}${sizeLabel} - ${formatPrice(item.price)}`;
    })
    .join('\n');

  const total = formatPrice(
    items.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0),
  );

  const addressBlock = address
    ? `\n\nEndereço para entrega:\n${address.street}, ${address.number} - ${address.neighborhood}\n${address.city}/${address.state} - ${address.cep}`
    : '';

  const paymentLabel = paymentMethods.map(translatePaymentMethod).join(', ');
  const deliveryLabel = deliveryMethods.map(translateDeliveryMethod).join(', ');

  return `Olá! Meu nome é ${customerName} e gostaria de fazer o seguinte pedido:\n\n${itemsList}\n\nTotal: ${total}${addressBlock}\n\nFormas de pagamento aceitas: ${paymentLabel}\nFormas de entrega: ${deliveryLabel}`;
}
```

`translatePaymentMethod`/`translateDeliveryMethod` mapeiam os enums (`PIX`, `DINHEIRO`,
`CARTAO_ENTREGA`, `CARTAO_ONLINE`, `RETIRADA_LOJA`, `ENTREGA_PROPRIA`, `CORREIOS`,
`MOTOBOY`) para rótulos em português — mesma lógica já prevista para exibir isso na
Vitrine da Loja/perfil da loja, reaproveitar se já existir.

## 5. Layout

```
┌────────────────────────────────────────┐
│  Finalizar pedido — Loja Exemplo         │
│                                          │
│  Itens (somente leitura):                │
│  - 5x Pants Black (M) - R$ 348,95        │
│                                          │
│  Endereço de entrega:                    │
│  ( ) Casa - Rua A, 123                   │
│  (•) Trabalho - Rua B, 456                │
│                                          │
│  Mensagem para o WhatsApp:                │
│  ┌────────────────────────────────────┐ │
│  │ Olá! Meu nome é...                  │ │
│  │ [editável]                          │ │
│  └────────────────────────────────────┘ │
│  ⓘ Este texto é só a mensagem enviada... │
│                                          │
│         [ Enviar no WhatsApp ]           │
└────────────────────────────────────────┘
```
- Itens: somente leitura — para editar quantidade/tamanho, o cliente volta pro carrinho
  (não duplicar essa lógica aqui)
- Se não houver endereço cadastrado, a seção de endereço não aparece (sem seletor vazio)

## 6. Estados

- **Loading inicial** (carregando carrinho/endereços/perfil): skeleton simples
- **Carrinho não encontrado** (ex: já foi finalizado em outra aba): mensagem + botão
  "Voltar para meus carrinhos"
- **Erro ao registrar pedido:** mensagem de erro específica, sem fechar a tela, sem abrir
  o WhatsApp (ver regra de negócio, seção 3)
- **Enviando:** botão "Enviar no WhatsApp" em estado de loading/desabilitado durante a
  chamada `POST /cart/:cartId/order`

## 7. Componentes

```
app/(account)/carrinhos/[cartId]/checkout/page.tsx

components/checkout/
├── checkout-items-summary.tsx   # itens somente leitura
├── address-selector.tsx          # radio de endereços, só renderiza se houver >0
└── whatsapp-message-editor.tsx   # textarea + aviso + botão de envio

features/checkout/
├── hooks/
│   └── use-create-order.ts       # POST /cart/:cartId/order
└── lib/
    └── build-whatsapp-message.ts # função da seção 4
```

## 8. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
componentes de UI seguindo Base UI + tailwind-variants + tailwind-merge (Button, Input
já existem em src/components/ui/). formatPrice já existe em src/lib/format-price.ts.

Tarefa: implementar a tela de checkout em
src/app/(account)/carrinhos/[cartId]/checkout/page.tsx, seguindo rigorosamente o
documento "Spec: Checkout / Solicitar Pedido via WhatsApp".

Pontos críticos a não deixar de fora:
- GET /carts não tem uma rota dedicada por cartId — buscar a lista completa e filtrar
  pelo cartId da rota
- payment_methods e delivery_methods vêm dentro do store embutido em GET /carts (se
  ainda não vierem na resposta real da API, deixar um comentário TODO indicando a
  dependência, e implementar a UI já preparada para quando existir)
- Mensagem do WhatsApp usa exatamente o template da seção 4 do documento — nome do
  cliente (GET /me), itens do carrinho, endereço selecionado (se houver), formas de
  pagamento/entrega da loja
- Editar o texto da mensagem NUNCA altera o que é enviado em POST /cart/:cartId/order
  (que não tem body) — exibir aviso sutil sobre isso
- ORDEM DAS OPERAÇÕES ao clicar "Enviar no WhatsApp": 1) POST /cart/:cartId/order,
  2) só se sucesso: abrir wa.me/{whatsapp}?text={mensagem} em nova aba + invalidar
  query ['carts'] + redirecionar para /pedidos (NÃO /pedidos/:orderId — a API não
  retorna o id do pedido criado)
- Se o endereço seletor tiver mais de uma opção, usar radio buttons; se não houver
  nenhum endereço cadastrado, omitir a seção inteira (não bloqueia o checkout)
- Itens do carrinho aparecem somente leitura nesta tela — não implementar edição de
  quantidade/tamanho aqui (isso é feito na tela de Carrinhos)

Estados: loading inicial (skeleton), carrinho não encontrado (mensagem + voltar para
carrinhos), erro ao registrar pedido (mensagem específica, sem navegar, sem abrir
WhatsApp), loading no botão durante o envio.

Toda chamada HTTP usa credentials: 'include'.

Não implementar: edição de itens nesta tela, múltiplos carrinhos no mesmo checkout —
o fluxo é sempre um carrinho (uma loja) por vez.
```