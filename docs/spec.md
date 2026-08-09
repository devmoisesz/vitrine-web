# Vitrine Web — Spec: Dados da Loja + Logo + Banner (Painel do Lojista)

## 1. Contexto

Rota: `src/app/painel/loja/page.tsx`. Acessível só por `Proprietário` (todas as rotas
desta tela exigem esse papel especificamente, não `Funcionário`).

Quatro seções: **Dados gerais**, **Formas de pagamento e entrega**, **Logo e Banner**, e
**Endereço da loja**.

## 2. Contrato de API

```
GET /store/:slug
Auth: deveria ser Public (ver documento de pendências da API) — usado aqui autenticado
para carregar os dados atuais do formulário
Resposta 200:
{
  "name": "...",
  "logo_url": "...",
  "banner_url": "...",
  "description": "...",
  "whatsapp": "...",
  "payment_methods": ["PIX", "DINHEIRO"],
  "delivery_methods": ["RETIRADA_LOJA", "MOTOBOY"],
  "address": Address | null
}

(confirmar se banner_url já está incluído neste DTO — necessário tanto aqui quanto na
Vitrine da Loja pública, que também vai exibir o banner)
```

```
PUT /store/:slug/edit
Auth: PROPRIETARIO
Body: { newName, newEmail, newDescription, newWhatsapp, newPaymentMethods, newDeliveryMethods }
Resposta: 204

(nomes de campo exatos assumidos seguindo o padrão "new" já usado em editProductBodySchema
— confirmar se bateu exatamente assim na implementação)
```

```
POST /stores/:slug/logo          (primeira vez, loja ainda sem logo)
Auth: PROPRIETARIO
FormFile: file
Resposta: 201

PATCH /stores/:slug/logo/change   (loja já tem logo, substituindo)
Auth: PROPRIETARIO
FormFile: file
Resposta: 200

DELETE /stores/:slug/logo/delete
Auth: PROPRIETARIO
Resposta: 204
```

```
POST /stores/:slug/banner          (primeira vez, loja ainda sem banner)
Auth: PROPRIETARIO
FormFile: file
Resposta: 201

PATCH /stores/:slug/banner/change   (loja já tem banner, substituindo)
Auth: PROPRIETARIO
FormFile: file
Resposta: 200

DELETE /stores/:slug/banner/delete
Auth: PROPRIETARIO
Resposta: 204

(mesmo padrão de rotas da logo — só troca "logo" por "banner" na URL, mesmo
comportamento, mesmos três estados)
```

```
POST /address/:slug/register/     (loja ainda não tem endereço)
Auth: PROPRIETARIO
Body: { label, cep, state, city, neighborhood, street, number, complement }
Resposta: 201

PUT /store/:slug/address           (loja já tem endereço, editando)
Auth: PROPRIETARIO
Body: { cep, state, city, neighborhood, street, number, complement }
Resposta: 204
```

## 3. Regras de Negócio

- **Uma loja só pode ter um endereço** — diferente do Perfil do cliente (múltiplos
  endereços com seletor), aqui é sempre **um único bloco**: se não existe, mostra
  formulário de cadastro; se existe, mostra os dados com opção de editar (nunca "+
  adicionar outro")
## 3.1 Cropper de Imagem (Logo e Banner)

Componente reaproveitável, usado nos dois fluxos de upload — o corte acontece **no
navegador, antes do envio**; o backend recebe sempre um arquivo já cortado no formato
certo, sem saber que houve edição.

**Biblioteca:** `react-easy-crop`
```bash
npm install react-easy-crop
```

**Fluxo (igual para "primeira vez" e "trocar"):**
1. Usuário seleciona um arquivo no input (pode ter qualquer proporção/tamanho)
2. Abre `ImageCropperDialog` (Dialog do Base UI) mostrando a imagem com uma moldura de
   corte na proporção certa — **1:1 para logo**, **4:1 para banner** (prop
   `aspectRatio` diferencia os dois usos do mesmo componente)
3. Usuário ajusta zoom/posição (pan) dentro da moldura
4. Ao confirmar: a área selecionada é renderizada num `<canvas>` e convertida em
   arquivo (`canvas.toBlob()`) — **esse arquivo cortado** é o que vai para
   `POST`/`PATCH` (não o arquivo original selecionado)
5. Ao confirmar o corte, já dispara o upload em seguida (estado de loading no botão de
   confirmar do dialog) — sem um passo extra de "revisar antes de enviar"
6. Cancelar o corte (botão "Cancelar" no dialog) não sobe nada, volta ao estado anterior

**Componente:**
```tsx
interface ImageCropperDialogProps {
  file: File;
  aspectRatio: number; // 1 para logo, 4 para banner
  isOpen: boolean;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}
```

Validações de tipo/tamanho de arquivo (png/jpg/jpeg/webp, ver limites na seção 3)
continuam acontecendo **antes** de abrir o cropper, no momento da seleção do arquivo
original — evita abrir o editor para um arquivo que já seria rejeitado de qualquer jeito.

**Nota prática:** como o resultado final é sempre cortado pro tamanho exato necessário
(não a imagem inteira original), o arquivo final tende a ser mais leve que o original
selecionado — ajuda a ficar dentro do limite de tamanho com menos fricção pro lojista.

## 3.2 Regras de Negócio — Logo e Banner

- **Logo e Banner: mesmos três estados possíveis, cada um independente** — sem
  imagem (mostra upload), com imagem (mostra atual + opções "Trocar" e "Remover"). O
  endpoint usado depende do estado atual de cada um (`POST` só na primeira vez,
  `PATCH` para trocar uma já existente) — logo e banner não dependem um do outro, a
  loja pode ter só um dos dois, os dois, ou nenhum
- **Banner é proporção widescreen** (tipo capa de perfil, não quadrado como a logo) —
  recomendo orientar visualmente isso na área de upload (ex: um placeholder retangular
  ~4:1, não quadrado), mesmo que o backend não valide proporção. Confirmar se o limite
  de tamanho de arquivo é o mesmo da logo (2MB) ou se banner permite mais, já que
  imagens widescreen tendem a pesar mais
- **Formas de pagamento/entrega:** checkboxes a partir dos enums já usados na Vitrine
  da Loja e no Checkout — reaproveitar o mesmo mapeamento de rótulos em português
  (`PIX`, `DINHEIRO`, `CARTAO_ENTREGA`, `CARTAO_ONLINE` / `RETIRADA_LOJA`,
  `ENTREGA_PROPRIA`, `CORREIOS`, `MOTOBOY`)

## 4. Layout

```
┌──────────────────────────────────────────┐
│  Dados da Loja                             │
│                                            │
│  ── Dados gerais ──────────────────────    │
│  Nome        [_____________________]      │
│  E-mail      [_____________________]      │
│  WhatsApp    [_____________________]      │
│  Descrição   [_____________________]      │
│              [ Salvar ]                    │
│                                            │
│  ── Formas de pagamento ───────────────    │
│  ☑ Pix  ☐ Dinheiro  ☑ Cartão na entrega    │
│  ☐ Cartão online                           │
│                                            │
│  ── Formas de entrega ─────────────────    │
│  ☑ Retirada na loja  ☐ Entrega própria     │
│  ☐ Correios  ☑ Motoboy                     │
│              [ Salvar formas ]              │
│                                            │
│  ── Banner ─────────────────────────────    │
│  [banner atual, widescreen]                 │
│                 [ Trocar ]  [ Remover ]     │
│                                            │
│  ── Logo ──────────────────────────────    │
│  [logo atual]   [ Trocar ]  [ Remover ]    │
│                                            │
│  ── Endereço ──────────────────────────    │
│  Rua Exemplo, 123 - Centro                 │
│  São Paulo/SP - 01001-000                  │
│              [ Editar endereço ]            │
└──────────────────────────────────────────┘
```
WhatsApp agora é editável (`newWhatsapp` no `PUT /store/:slug/edit`) — aplicar máscara
de telefone brasileiro no input, mesmo padrão já usado no cadastro de loja do Admin.

## 5. Estados

- Loading inicial: skeleton nas quatro seções
- Erro ao carregar: mensagem + botão "Tentar novamente"
- Sucesso ao salvar cada seção: confirmação inline temporária, sem navegar (mesmo
  padrão já usado na tela de Perfil do cliente)
- Upload de logo/banner: estado de loading no botão durante o envio; erro de
  tipo/tamanho de arquivo tratado igual à spec de Gestão de Imagens do Produto (mesmos
  limites: png/jpg/jpeg/webp — confirmar tamanho máximo do banner, ver seção 3)

## 6. Componentes

```
app/painel/loja/page.tsx

components/painel/
├── store-general-form.tsx        # nome, e-mail, descrição
├── payment-methods-checklist.tsx  # checkboxes de payment_methods
├── delivery-methods-checklist.tsx # checkboxes de delivery_methods
├── store-logo-manager.tsx         # upload/trocar/remover logo (usa ImageCropperDialog)
├── store-banner-manager.tsx       # upload/trocar/remover banner (usa ImageCropperDialog)
├── image-cropper-dialog.tsx       # reaproveitado por logo e banner (aspectRatio 1 ou 4)
└── store-address-section.tsx      # cadastrar OU editar (nunca lista)

features/painel/hooks/
├── use-store-settings.ts          # GET /store/:slug (autenticado)
├── use-update-store.ts            # PUT /store/:slug/edit
├── use-upload-store-logo.ts        # POST /stores/:slug/logo
├── use-change-store-logo.ts        # PATCH /stores/:slug/logo/change
├── use-delete-store-logo.ts        # DELETE /stores/:slug/logo/delete
├── use-upload-store-banner.ts      # POST /stores/:slug/banner
├── use-change-store-banner.ts      # PATCH /stores/:slug/banner/change
├── use-delete-store-banner.ts      # DELETE /stores/:slug/banner/delete
└── use-save-store-address.ts       # POST /address/:slug/register/ + PUT /store/:slug/address
```

## 7. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
React Hook Form + Zod, componentes de UI seguindo Base UI + tailwind-variants +
tailwind-merge (Button, Input já existem em src/components/ui/). O mapeamento de rótulos
de payment_methods/delivery_methods (enum -> português) já existe (usado na Vitrine da
Loja e no Checkout) — reaproveitar, não recriar.

Tarefa: implementar a tela de dados da loja em src/app/painel/loja/page.tsx, seguindo
rigorosamente o documento "Spec: Dados da Loja + Logo (Painel do Lojista)". Acessível
só para role === 'Proprietário' (adicionar verificação client-side além do middleware
já existente em /painel, que só garante Funcionário OU Proprietário de forma ampla).

Seções:
1. Dados gerais (nome, e-mail, WhatsApp com máscara de telefone brasileiro, descrição)
   via PUT /store/:slug/edit
2. Formas de pagamento e entrega: checkboxes a partir dos enums já usados no projeto,
   também via PUT /store/:slug/edit (mesmo formulário/submit da seção 1, ou botão de
   salvar próprio — à escolha, mas os dados vêm todos do mesmo endpoint)
3. Logo: se a loja não tiver logo, mostrar upload (POST /stores/:slug/logo); se já
   tiver, mostrar a logo atual com opções "Trocar" (PATCH /stores/:slug/logo/change) e
   "Remover" (DELETE /stores/:slug/logo/delete) — mesmas validações de arquivo da spec
   de Gestão de Imagens do Produto (png/jpg/jpeg/webp, máximo 2MB). Upload e troca
   passam OBRIGATORIAMENTE pelo ImageCropperDialog (aspectRatio=1) antes de enviar —
   nunca subir o arquivo original sem passar pelo corte
4. Banner: MESMO padrão exato da Logo, só trocando "logo" por "banner" nas rotas
   (POST /stores/:slug/banner, PATCH /stores/:slug/banner/change,
   DELETE /stores/:slug/banner/delete) — três estados independentes (sem/com banner,
   trocar, remover). Upload e troca passam pelo MESMO ImageCropperDialog, mas com
   aspectRatio=4 (widescreen, não quadrado)

Implementar src/components/painel/image-cropper-dialog.tsx usando a biblioteca
react-easy-crop (npm install react-easy-crop), como componente reaproveitável entre
logo e banner (prop aspectRatio diferencia os dois usos). Fluxo: seleciona arquivo →
valida tipo/tamanho ANTES de abrir o dialog → abre cropper → usuário ajusta zoom/pan →
confirma → gera arquivo cortado via canvas.toBlob() → dispara o upload automaticamente
(sem passo extra de revisão) → estado de loading no botão de confirmar durante o envio.
Cancelar no dialog não sobe nada.
5. Endereço: se a loja não tiver endereço cadastrado, mostrar formulário de cadastro
   (POST /address/:slug/register/, com autopreenchimento via ViaCEP); se já tiver,
   mostrar os dados com opção "Editar" (PUT /store/:slug/address) — NUNCA permitir
   cadastrar mais de um endereço para a loja (diferente do Perfil do cliente)

Cada seção salva de forma independente (botão de salvar próprio), com confirmação
inline ao salvar com sucesso, sem navegar para outra tela.

Toda chamada HTTP usa credentials: 'include'.

Não implementar: histórico de alterações, múltiplos endereços de loja — fora do escopo.
```