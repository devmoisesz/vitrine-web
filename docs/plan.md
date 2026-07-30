# Vitrine Web — Spec: Dashboard do Admin

## 1. Contexto

Rota: `src/app/admin/page.tsx`, dentro do layout próprio `src/app/admin/layout.tsx`
(sidebar de navegação, sem Header do catálogo). Protegida por `src/middleware.ts`, que
decodifica o cookie `refreshToken` (JWT já existente) e só permite acesso a usuários com
`role === 'Admin'`.

## 2. Layout do Admin (`src/app/admin/layout.tsx`)

```
┌───────────┬────────────────────────────────────┐
│  Vitrine  │  Dashboard                          │
│  Web       │                                     │
│  (admin)   │  [conteúdo da página atual]          │
├───────────┤                                     │
│ Dashboard  │                                     │
│ Lojas      │                                     │
│ Categorias │                                     │
├───────────┤                                     │
│ Sair       │                                     │
└───────────┴────────────────────────────────────┘
```
- Sidebar fixa à esquerda (desktop), vira menu colapsável no mobile
- Mesmos tokens de cor/fonte do projeto (preto/branco, Bodoni Moda + Inter), mas **sem**
  reaproveitar o `Header` do consumidor — nada de busca/carrinho aqui
- Item "Sair" chama `POST /logout` e redireciona para `/login`

## 3. Middleware de Proteção (`src/middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, importSPKI } from 'jose';

const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!; 

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
  }

  try {
    const key = await importSPKI(PUBLIC_KEY, 'RS256');
    const { payload } = await jwtVerify(refreshToken, key);

    if (payload.role !== 'Admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
  }
}

export const config = {
  matcher: '/admin/:path*',
};
```

### Explicação, linha por linha

1. **`if (!pathname.startsWith('/admin'))`** — redundante com o `matcher` (ver item 6),
   mas funciona como segunda camada de segurança caso o matcher algum dia mude.
2. **`request.cookies.get('refreshToken')`** — o ponto chave: mesmo o `refreshToken`
   sendo `httpOnly` (JavaScript do navegador não consegue ler), o **middleware consegue**,
   porque roda no servidor e recebe o cabeçalho `Cookie` bruto enviado pelo navegador.
   `httpOnly` só bloqueia leitura via `document.cookie` no cliente, nunca o recebimento
   pelo servidor.
3. **Sem cookie nenhum** → visitante nunca logou ou a sessão expirou de vez → redireciona
   pro login, guardando `/admin` como destino pra voltar depois de autenticar.
4. **`jwtVerify(refreshToken, key)`** — a parte de segurança real. Decodificar um JWT é
   trivial (payload é só base64), mas **verificar a assinatura** com a chave pública RSA
   confirma que o token foi genuinamente emitido pelo backend. Sem essa verificação,
   qualquer um poderia forjar um cookie `refreshToken` com `role: "Admin"` escrito à mão.
5. **`payload.role !== 'Admin'`** — cobre o caso de alguém **logado, mas sem permissão**
   (Cliente ou Colaborador) tentando acessar `/admin` — manda pra home, não pro login
   (a pessoa já está autenticada, só não tem o papel certo).
6. **`catch` genérico** — token expirado, corrompido ou com assinatura inválida caem
   aqui, tratados como "não autenticado".
7. **`config.matcher: '/admin/:path*'`** — instrui o Next.js a só invocar essa função
   para rotas dentro de `/admin`, evitando rodar verificação de JWT em toda requisição
   do site (checagem em nível de roteamento, mais eficiente que fazer isso dentro da
   função para cada request).

## 4. Contrato de API (dashboard)

```
GET /stores?page=
Auth: Public (mas usada aqui autenticado, sem diferença de comportamento)
Resposta: array de Store (ver estrutura completa na spec de Vitrine da Loja)
```
Usado para a lista de "últimas lojas cadastradas" — pegar a primeira página, já vem
ordenado por mais recente (confirmar com o backend se a ordenação padrão é por
`createdAt desc`; se não for, é um ajuste a pedir).

## 5. Conteúdo do Dashboard

### Atalhos diretos (topo da página, sempre visíveis)
Dois botões/cards de destaque:
- **"+ Cadastrar loja"** → `/admin/lojas/nova` (tela futura — ainda não especificada,
  pendente de esclarecer se o corpo do `POST /store` já inclui dados do Dono)
- **"+ Cadastrar categoria"** → `/admin/categorias/nova` (tela futura)

### Últimas lojas cadastradas
- Tabela simples (não card, já que é contexto de admin): nome, e-mail de contato,
  data de criação, status (ativa/inativa — **atenção:** `GET /stores` não retorna um
  campo de status explícito no exemplo da documentação; se a loja desativada some da
  listagem pública mas ainda aparece aqui, precisa confirmar isso com o backend antes
  de desenhar a coluna de status)
- Link "Ver todas" → `/admin/lojas` (listagem completa, tela futura)
- Sem paginação nesta tela — só as primeiras ~10 lojas, é um resumo, não a listagem completa

## 6. Estados

- Loading: skeleton da tabela (linhas cinza)
- Erro: mensagem + botão "Tentar novamente"
- Lista vazia (nenhuma loja cadastrada ainda): "Nenhuma loja cadastrada." — não deve
  acontecer em produção, mas cobre o ambiente recém-criado/dev

## 7. Componentes

```
app/admin/
├── layout.tsx              # sidebar + guard visual (complementa o middleware)
└── page.tsx                 # dashboard

components/admin/
├── admin-sidebar.tsx
├── admin-shortcut-card.tsx   # os dois atalhos ("+ Cadastrar loja" / "+ Cadastrar categoria")
└── recent-stores-table.tsx

features/admin/
├── hooks/
│   └── use-recent-stores.ts   # GET /stores?page=1
└── api/
    └── fetch-stores.ts
```

## 8. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
componentes de UI seguindo Base UI + tailwind-variants + tailwind-merge (Button, Badge
já existem em src/components/ui/).

IMPORTANTE: antes desta tarefa, configurar src/middleware.ts (código já definido na
spec "Dashboard do Admin", seção que usa a biblioteca `jose` para decodificar o cookie
refreshToken e checar role === 'Admin') e a variável de ambiente JWT_PUBLIC_KEY.

Tarefa: implementar o layout e dashboard do admin:
1. src/app/admin/layout.tsx — sidebar de navegação (Dashboard, Lojas, Categorias, Sair),
   SEM reaproveitar o Header do consumidor
2. src/app/admin/page.tsx — dashboard principal

Dashboard deve conter:
- Dois cards de atalho no topo: "+ Cadastrar loja" (link para /admin/lojas/nova) e
  "+ Cadastrar categoria" (link para /admin/categorias/nova) — essas duas rotas ainda
  não existem, só criar os links, sem quebrar se a página de destino não existir ainda
- Tabela "Últimas lojas cadastradas" a partir de GET /stores?page=1 (nome, e-mail,
  data de criação) + link "Ver todas" para /admin/lojas
- Estados: loading (skeleton de tabela), erro (com retry), vazio ("Nenhuma loja
  cadastrada.")

Sidebar: mesmos tokens de cor/fonte do projeto (preto/branco, Bodoni Moda/Inter), mas
composição própria de admin (sidebar + conteúdo), não o layout do catálogo. Item "Sair"
chama POST /logout e redireciona para /login.

Toda chamada HTTP usa credentials: 'include'.

Não implementar ainda: telas de /admin/lojas/nova, /admin/categorias/nova, /admin/lojas
(listagem completa) — só os links partindo do dashboard, o conteúdo dessas rotas vem
em specs futuras.
```

## 9. Registro para a Futura Tela "Cadastrar Loja"

Contrato confirmado do `POST /store` (schema Zod real do backend):

```typescript
export const registerStoreBodySchema = z.object({
  store_name: z.string({ message: 'O nome da loja é obrigatório' }).trim(),

  store_email: z
    .string()
    .email('Insira um e-mail de loja válido')
    .optional()
    .or(z.literal('')),

  owner_email: z
    .string({ message: 'O e-mail do proprietário é obrigatório' })
    .email('Insira um e-mail de proprietário válido'),

  whatsapp: z
    .string({ message: 'O WhatsApp é obrigatório' })
    .min(10, 'Número de telefone incompleto')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10 || val.length === 11,
      'O número de WhatsApp deve conter o DDD e um número válido (10 ou 11 dígitos).'),
});
```

Campos do formulário: `store_name` (obrigatório), `store_email` (opcional),
`owner_email` (obrigatório), `whatsapp` (obrigatório, validado como 10 ou 11 dígitos
após remover formatação).

### Regra de negócio confirmada: o proprietário precisa já ter conta

Diferente do que eu tinha registrado antes: **o Dono não é criado por este endpoint.**
`owner_email` deve corresponder a um **usuário que já existe** na plataforma (cadastrado
previamente via `/cadastro` normal ou via Google) — o cadastro de loja só **vincula** a
loja a esse e-mail, não cria a conta do zero. Ou seja, o fluxo esperado é: o futuro dono
se cadastra primeiro como um usuário comum (qualquer método), e só depois o Admin
registra a loja usando esse mesmo e-mail para vinculá-lo como proprietário.

**Consequência para a tela:** o formulário deve deixar isso explícito para o Admin (texto
de apoio no campo `owner_email`), e tratar o erro caso o e-mail não corresponda a nenhum
usuário cadastrado (ver seção 11, tratamento de erros).

## 10. Spec: Tela "Cadastrar Loja" (`/admin/lojas/nova`)

### Layout
Formulário simples, dentro do mesmo layout do admin (sidebar + área de conteúdo):
```
┌────────────────────────────────────┐
│  Cadastrar Loja                     │
│                                      │
│  Nome da loja *                     │
│  [_____________________________]    │
│                                      │
│  E-mail da loja (opcional)          │
│  [_____________________________]    │
│                                      │
│  E-mail do proprietário *           │
│  [_____________________________]    │
│  ⓘ Este e-mail já deve pertencer a  │
│    uma conta cadastrada na          │
│    plataforma.                      │
│                                      │
│  WhatsApp *                         │
│  [_____________________________]    │
│                                      │
│         [ Cadastrar loja ]          │
└────────────────────────────────────┘
```

### Campos e validação (React Hook Form + Zod, espelhando o schema do backend)
- `store_name`: obrigatório, texto livre
- `store_email`: opcional — se preenchido, validar formato de e-mail; se vazio, enviar
  como string vazia (`''`) ou omitir, conforme o schema aceita `.optional().or(z.literal(''))`
- `owner_email`: obrigatório, formato de e-mail válido
- `whatsapp`: obrigatório, aplicar máscara de telefone brasileiro no input (ex:
  `(11) 91234-5678`) enquanto o usuário digita, mas validar no submit removendo a
  formatação e checando 10 ou 11 dígitos — espelha exatamente o `.transform()` +
  `.refine()` do backend, para o erro aparecer no frontend antes de gastar uma request

### Submissão
`POST /store` com `{ store_name, store_email, owner_email, whatsapp }`

### Tratamento de Erros
- **`owner_email` não corresponde a nenhum usuário cadastrado:** mensagem específica no
  campo, ex: *"Nenhuma conta encontrada com este e-mail. O proprietário precisa se
  cadastrar antes."* (formato exato do erro depende da resposta do backend — confirmar
  o status/mensagem retornados quando isso acontece, para mapear corretamente)
- **Nome de loja duplicado ou outro conflito:** mensagem genérica de erro vinda da API,
  exibida no topo do formulário (não teria campo específico pra apontar)
- **Sucesso:** confirmação (toast ou mensagem inline) + redirecionar para
  `/admin` (dashboard) ou `/admin/lojas` (listagem completa, quando existir)

### Componentes
```
app/admin/lojas/nova/page.tsx

components/admin/
└── register-store-form.tsx

features/admin/hooks/
└── use-register-store.ts   # POST /store
```

## 11. Prompt Pronto para o Agente de IA (Cadastrar Loja)

```
Contexto: mesmo projeto do dashboard do admin (Next.js 14 App Router + TypeScript strict
+ Tailwind v4). Layout de admin (sidebar) já existe em src/app/admin/layout.tsx. Button,
Input já existem em src/components/ui/.

Tarefa: implementar a tela de cadastrar loja em src/app/admin/lojas/nova/page.tsx,
seguindo rigorosamente a seção 10 do documento "Dashboard do Admin".

Campos (React Hook Form + Zod, espelhando o schema real do backend):
- store_name: obrigatório
- store_email: opcional, validar formato se preenchido
- owner_email: obrigatório, formato de e-mail. Exibir texto de apoio abaixo do campo:
  "Este e-mail já deve pertencer a uma conta cadastrada na plataforma."
- whatsapp: obrigatório, aplicar máscara de telefone brasileiro no input, validar no
  submit removendo formatação e checando 10 ou 11 dígitos (espelha o .transform()
  + .refine() do backend)

Submissão: POST /store com { store_name, store_email, owner_email, whatsapp }.

Tratamento de erro específico: se a API retornar erro indicando que owner_email não
corresponde a um usuário existente, mostrar mensagem no campo owner_email (não um erro
genérico) — ajustar conforme o formato real de erro que a API retornar.

Sucesso: confirmação inline + redirecionar para /admin.

Toda chamada HTTP usa credentials: 'include'.

Não implementar: upload de logo da loja neste formulário (é feito depois, pelo próprio
lojista já logado) — fora do escopo desta tela.
```