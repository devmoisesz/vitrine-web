# Vitrine Web — Arquitetura de Frontend (MVP)

> Documento de referência viva do projeto. Atualizar conforme decisões forem tomadas.

---

## 1. Stack Técnica

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js 14+ (App Router) + TypeScript | SEO do catálogo público (SSR/SSG) + rotas mistas (públicas x autenticadas) |
| Estilo | Tailwind CSS **v4** (`@theme`, CSS variables — sem `tailwind.config.ts`) | Tokens de design direto no CSS, mantendo consistência |
| Componentes headless | Base UI React (`@base-ui/react`) | Base acessível/sem estilo para Dialog, Tabs, Select, Menu etc. — estilizamos por cima com os tokens do projeto |
| Variantes de componente | Tailwind Variants (`tailwind-variants`) | Define variantes (size, variant) de forma tipada, no padrão adotado pro projeto (ver seção 10) |
| Merge de classes | Tailwind Merge (`tailwind-merge`) | Evita conflito de classes ao permitir `className` sobrescrever estilos padrão dos componentes |
| Ícones | Lucide React | Ícones consistentes, mesmo padrão usado nos exemplos de componente |
| Estado do carrinho | Zustand | Carrinho **por loja** (múltiplos carrinhos simultâneos) — mais simples que Context API pra esse caso |
| Data fetching / cache | TanStack Query (React Query) | Cache, refetch, loading/error state prontos para os 47 endpoints do backend |
| Formulários | React Hook Form + Zod | Zod já é usado no backend (NestJS) — mesma linguagem de validação nos dois lados |
| Autenticação | Cookies httpOnly (access + refresh) | Segue o padrão que o backend já implementa (JWT RS256) |

**Nota sobre ambiente de desenvolvimento:** aqui no chat eu não tenho acesso à internet para rodar `npm install` ou `create-next-app`. O fluxo prático é: você inicializa o projeto localmente, e eu vou te entregando arquivos de código prontos para colar (e prototipando telas visualmente aqui antes de virarem código, quando fizer sentido).

```bash
npx create-next-app@latest vitrine-web-frontend --typescript --app --eslint --tailwind
cd vitrine-web-frontend

npm install zustand @tanstack/react-query react-hook-form zod @hookform/resolvers
npm install tailwind-variants tailwind-merge @base-ui/react lucide-react
```

---

## 2. Identidade Visual / Design Tokens

**Referência de estilo:** Zara / Balenciaga — minimalismo editorial, espaço em branco generoso, fotografia do produto como protagonista, sem animações elaboradas no MVP.

### Paleta e Tipografia (Tailwind v4 — `src/app/globals.css`)
```css
@import "tailwindcss";

@theme {
  --color-black:   #000000;   /* texto principal, botões primários */
  --color-white:   #FFFFFF;   /* fundo */
  --color-gray-50:  #FAFAFA;  /* fundo alternativo sutil */
  --color-gray-200: #E5E5E5;  /* bordas, divisores */
  --color-gray-500: #737373;  /* texto secundário */

  --font-serif: "Bodoni Moda", serif;  /* headings, nome de produto, preço em destaque */
  --font-sans:  "Inter", sans-serif;   /* UI, corpo de texto, botões, labels */
}
```
Sem cores de "sistema" (azul, verde, vermelho) — estados (erro, sucesso, disponível/indisponível) são comunicados por peso tipográfico, ícones e texto, não por cor, para manter o clean monocromático do logo.

**Exceção: telas de Login e Cadastro usam a fonte Lato** (headings e corpo), escopada
apenas ao route group `(auth)` via `next/font/google` no `layout.tsx` daquele grupo — não
entra no `@theme` global, já que é específica dessas duas telas.
```tsx
// src/app/(auth)/layout.tsx
import { Lato } from 'next/font/google'
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'] })

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className={lato.className}>{children}</div>
}
```
Justificativa das escolhas: **Bodoni Moda** é uma revival direta de Bodoni, próxima do
"V" do logo. **Inter** é limpo e legível em telas pequenas para UI/corpo de texto.

### Princípios de layout
- Cards de produto sem sombra pesada — separação por espaçamento e/ou borda fina (`gray-200`)
- Fotografia em proporção generosa (retrato, estilo lookbook)
- Grid de catálogo responsivo: 2 colunas mobile → 3-4 colunas desktop
- Microinteração do cursor do logo pode aparecer em hovers discretos (ex: cards de produto), mas nada além disso no MVP

---

## 3. Estrutura de Pastas (feature-based)

Organização por **domínio de negócio**, não por tipo de arquivo — mais fácil de navegar quando a experiência com frontend ainda está em construção.

```
src/
├── app/                          # Rotas (App Router)
│   ├── (public)/                 # Layout público — catálogo, sem auth
│   │   ├── page.tsx               # Home / vitrine geral (todas as lojas)
│   │   ├── loja/[slug]/page.tsx   # Vitrine de uma loja específica
│   │   └── produto/[id]/page.tsx  # Detalhe do produto
│   ├── (auth)/                   # Layout de autenticação
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   ├── (account)/                # Layout autenticado
│   │   ├── carrinho/page.tsx
│   │   ├── pedidos/page.tsx
│   │   └── perfil/page.tsx
│   └── layout.tsx                # Layout raiz (header, footer)
│
├── components/
│   ├── ui/                       # Design system: Button, Input, Badge, Skeleton...
│   ├── product/                  # ProductCard, ProductGallery, ProductInfo
│   ├── store/                    # StoreHeader, StoreCard
│   ├── cart/                     # CartDrawer, CartItem, CartSummary
│   └── layout/                   # Header, Footer, Navbar
│
├── features/                     # Lógica de negócio por domínio
│   ├── catalog/
│   │   ├── hooks/                 # useProducts, useProduct, useStores
│   │   └── api/                   # fetchers do catálogo
│   ├── cart/
│   │   ├── store/                 # zustand store — um carrinho por loja
│   │   └── hooks/
│   ├── auth/
│   │   ├── hooks/
│   │   └── api/
│   └── orders/
│       ├── hooks/
│       └── api/
│
├── lib/
│   ├── api-client.ts              # instância de fetch/axios + interceptor de refresh token
│   └── utils.ts
│
├── types/                        # Product, Store, Order, User, CartItem...
└── styles/
    └── globals.css                # tokens Tailwind (cores, fontes)
```

---

## 4. Regras de Negócio → Implicações de UI

| Regra (do backend) | Implicação no frontend |
|---|---|
| Carrinho por loja (não único) | `useCartStore` do Zustand indexado por `storeId`; UI precisa deixar claro "isso é o carrinho da Loja X" |
| Autenticação obrigatória para carrinho/pedido | Botão "adicionar ao carrinho" sem login → redireciona para login, guarda intenção e volta |
| Checkout gera mensagem para WhatsApp | Tela de revisão do pedido = "checkout" visual, mas o botão final abre `wa.me` com mensagem pré-formatada, não processa pagamento |
| Produto sem estoque é rejeitado no carrinho | Desabilitar botão de compra e sinalizar "indisponível" já no card do catálogo |
| Loja desativada oculta produtos | Sem tratamento especial no front — o backend já não retorna esses produtos |

---

## 5. Divisão de Telas — MVP (foco no consumidor)

| Tela | Complexidade | Responsável |
|---|---|---|
| Home / Catálogo geral (busca, filtros, paginação) | Alta | Eu (Claude) |
| Vitrine da loja | Média | Eu (Claude) |
| Detalhe do produto (galeria, tamanhos, add ao carrinho) | Alta | Eu (Claude) |
| Carrinho por loja (drawer/página) | Alta | Eu (Claude) |
| Checkout / revisão → geração da mensagem WhatsApp | Alta | Eu (Claude) |
| Login | Baixa | Agente de IA |
| Cadastro | Baixa | Agente de IA |
| Histórico de pedidos | Baixa/Média | Agente de IA |
| Perfil do usuário | Baixa | Agente de IA |

Painel do lojista (cadastro de produtos, gestão de loja, funcionários) fica para uma **segunda fase**, após validar a experiência do consumidor.

---

## 6. Prompts prontos para o Agente de IA

Use estes prompts diretamente no Claude Code (ou outro agente). Cada um pressupõe que a arquitetura acima (pastas, tokens Tailwind, `api-client.ts`) já existe no projeto.

### Prompt — Tela de Login

```
Contexto: projeto Next.js 14 (App Router) + TypeScript + Tailwind do marketplace
Vitrine Web. Design system já configurado em tailwind.config (cores preto/branco/
cinza, fonte serif "Bodoni Moda" para headings e "Inter" para corpo). Estrutura de
pastas feature-based em src/. Cliente HTTP configurado em src/lib/api-client.ts.

Tarefa: implementar a tela de login em src/app/(auth)/login/page.tsx.

Requisitos funcionais:
- Formulário com campos: e-mail e senha, usando React Hook Form + Zod para validação
- Ao submeter, chamar POST /authenticate no backend (via api-client.ts)
- Em caso de sucesso: backend define cookies httpOnly (access + refresh) automaticamente
  na resposta; redirecionar o usuário para a página anterior (ou home, se não houver)
- Em caso de erro (credenciais inválidas): exibir mensagem de erro abaixo do formulário,
  sem alert() nativo
- Link para a tela de cadastro (/cadastro) para quem ainda não tem conta
- Estado de loading no botão de submit (desabilitado + indicador visual durante a request)

Requisitos de UI:
- Layout minimalista, centralizado, consistente com a identidade visual (preto/branco,
  serif nos títulos, bastante espaço em branco)
- Usar os componentes de src/components/ui/ (Button, Input) — criar se ainda não existirem,
  seguindo os design tokens do projeto
- Responsivo (mobile e desktop)

Não implementar: recuperação de senha, login social — fora do escopo do MVP.
```

### Prompt — Tela de Cadastro

```
Contexto: mesmo projeto do prompt de login (Next.js 14 App Router + TypeScript +
Tailwind, design system preto/branco/serif já configurado, api-client.ts já existe).

Tarefa: implementar a tela de cadastro em src/app/(auth)/cadastro/page.tsx.

Requisitos funcionais:
- Formulário com campos: nome, e-mail, senha, confirmação de senha, usando
  React Hook Form + Zod para validação (senha e confirmação devem ser iguais;
  validar formato de e-mail)
- Ao submeter, chamar POST /accounts no backend (via api-client.ts)
- Em caso de sucesso: redirecionar para a tela de login com uma mensagem de
  sucesso (ex: via query param ou toast)
- Em caso de erro (ex: e-mail já cadastrado): exibir mensagem de erro específica
  retornada pela API
- Link para a tela de login (/login) para quem já tem conta
- Estado de loading no botão de submit

Requisitos de UI:
- Mesma identidade visual da tela de login — devem parecer parte do mesmo fluxo
- Reaproveitar componentes de src/components/ui/ (não recriar Button/Input do zero)
- Responsivo (mobile e desktop)

Não implementar: verificação de e-mail, campos adicionais de perfil — fora do escopo do MVP.
```

---

## 9. Padrão de Componentes (para prompts de agente)

Convenção adotada especificamente para **componentes de UI** (`src/components/ui/` e
similares) — não se aplica às specs de **tela**, que seguem o formato de documento
detalhado já usado neste projeto (contexto, regras de negócio, fluxos, endpoints, prompt
final — ver exemplos: spec de imagens do produto, spec de login).

### Stack de componente
- React 19 (sem `forwardRef`)
- TypeScript strict
- Tailwind CSS v4 com `@theme` e CSS variables (tokens deste documento)
- Base UI React (`@base-ui/react`) para componentes headless (Dialog, Tabs, Select, Menu)
- Tailwind Variants (`tailwind-variants`) para variantes
- Tailwind Merge (`tailwind-merge`) para merge de classes
- Lucide React para ícones

### Convenções
- Arquivos: lowercase com hífens (`user-card.tsx`, `use-modal.ts`)
- Sempre **named exports**, nunca `export default`
- Sem barrel files (`index.ts`) nas pastas internas
- `ComponentProps<'elemento'>` + `VariantProps<typeof variants>` para tipagem
- Variantes com `tv()`, classes finais sempre com `twMerge()`
- `data-slot` em todo componente, para identificação
- Estados via `data-[state]:` (ex: `data-[disabled]:opacity-50`)
- `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` em interativos
- Cores sempre dos tokens do tema (nunca hardcoded)
- Botões de ícone exigem `aria-label`
- `{...props}` sempre no final

### Exemplo de referência (Button)
```tsx
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export const buttonVariants = tv({
	base: [
		'inline-flex cursor-pointer items-center justify-center font-medium rounded-lg border transition-colors',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
		'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
	],
	variants: {
		variant: {
			primary: 'border-black bg-black text-white hover:bg-gray-900',
			secondary: 'border-gray-200 bg-white text-black hover:bg-gray-50',
			ghost: 'border-transparent bg-transparent text-gray-500 hover:text-black',
		},
		size: {
			sm: 'h-8 px-3 gap-1.5 text-xs [&_svg]:size-3',
			md: 'h-10 px-4 gap-2 text-sm [&_svg]:size-3.5',
			lg: 'h-12 px-6 gap-2.5 text-base [&_svg]:size-4',
		},
	},
	defaultVariants: { variant: 'primary', size: 'md' },
})

export interface ButtonProps
	extends ComponentProps<'button'>,
		VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, disabled, children, ...props }: ButtonProps) {
	return (
		<button
			type="button"
			data-slot="button"
			data-disabled={disabled ? '' : undefined}
			className={twMerge(buttonVariants({ variant, size }), className)}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	)
}
```
*(Paleta adaptada aos tokens preto/branco/cinza do projeto — a base conceitual segue o
padrão de referência.)*

### Prompt-base para o agente gerar um novo componente
```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css (@theme): cores
--color-black, --color-white, --color-gray-50/200/500; fontes --font-serif (Bodoni
Moda) e --font-sans (Inter). Stack de componente: React 19 sem forwardRef, Base UI
React (@base-ui/react) para partes headless, tailwind-variants (tv()) para variantes,
tailwind-merge (twMerge()) para merge de classes, lucide-react para ícones.

Convenções obrigatórias:
- Arquivo lowercase-com-hifen, named export (nunca default export), sem barrel files
- ComponentProps<'elemento'> + VariantProps<typeof variants> para tipagem
- data-slot em todo componente; estados via data-[state]:
- focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring em interativos
- Cores sempre dos tokens do tema, nunca hardcoded
- aria-label em botões de ícone; {...props} sempre no final

Tarefa: [descrever o componente/design a converter aqui]
```

## 10. Próximos Passos

1. Rodar os comandos de instalação da seção 1 e configurar o `globals.css` com os tokens
2. Criar os componentes base (`Button`, `Input`, `Badge`) seguindo o padrão da seção 9
3. Começar pela **Home / Catálogo** — posso prototipar visualmente aqui no chat antes de virar código
4. Telas de login/cadastro vão para o agente com os prompts acima
