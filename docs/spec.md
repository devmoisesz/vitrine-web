# Vitrine Web — Spec: Acesso ao Painel a partir do Header (Consumidor)

## 1. Contexto / Problema

Colaboradores (`Funcionário`/`Proprietário`) e `Admin` também navegam pelo site público
(ex: para ver como a própria loja aparece no catálogo). Hoje, depois de logar, fechar a
aba e voltar pela URL normal do site, essas pessoas **ficam presas no catálogo público**
— não existe nenhum link visível de volta para `/painel` ou `/admin`. A única forma de
chegar lá é digitando a URL de cor.

**Objetivo:** adicionar, no `Header` do site (o mesmo componente já usado na Home e em
todas as páginas públicas), um link condicional — visível só para quem tem o papel
correspondente — que leva direto para o painel certo.

## 2. Regra de Negócio

- **`role === 'Proprietário'` ou `role === 'Funcionário'`** → mostrar link **"Painel da
  loja"**, apontando para `/painel`
- **`role === 'Admin'`** → mostrar link **"Painel admin"**, apontando para `/admin`
- **`role === 'Cliente'` ou usuário não autenticado** → nenhum dos dois aparece (nada
  muda para o fluxo atual)
- Só um dos dois pode aparecer por vez — um usuário tem um papel só, nunca os dois
  simultaneamente
- Fonte do dado: `role` já disponível via `useAuth()` (mesmo hook já usado no Header
  para decidir entre carrinho e botão de login) — não é necessária nenhuma chamada de
  API nova

## 3. Onde entra no layout

**Desktop (`md:` e acima):** texto normal, ao lado do link "Lojas" já existente no
Header, no mesmo grupo de navegação (antes dos ícones de busca/carrinho).

**Mobile:** **não repetir o mesmo link em formato de texto** — o Header no mobile já é
apertado (logo + busca expansível + carrinho/login), e adicionar mais um link de texto
ali arrisca quebrar layout ou forçar quebra de linha feia quando a busca expande. Em vez
disso, no mobile o link vira **um ícone compacto**, com `aria-label` descritivo (sem
texto visível, mas acessível):
- Colaborador (Funcionário/Proprietário): ícone tipo `Store` (lucide-react),
  `aria-label="Painel da loja"`
- Admin: ícone tipo `LayoutDashboard` (lucide-react), `aria-label="Painel admin"`

Posicionado no mesmo grupo dos outros ícones do Header (perto do ícone de busca), mesmo
tamanho (`size-5`) e mesmo espaçamento (`gap-3`) já usados nos outros ícones da barra,
para não alterar a altura/densidade do Header em nenhum breakpoint.

```
Desktop (md:+):
[Logo]                    [Lojas] [Painel da loja]        [🔍] [🛒/Entrar]

Mobile (< md:):
[Logo]                           [🏬] [🔍] [🛒/Entrar]
                                   ↑
                          ícone do painel, só quando aplicável
```

Usar a mesma classe de breakpoint já usada em outros componentes do projeto (`hidden
md:inline` no texto do desktop, `md:hidden` no ícone do mobile) — não introduzir um
breakpoint novo/diferente do resto do projeto.

## 4. Comportamento

- Clique leva direto para `/painel` ou `/admin` (sem confirmação, sem interstitial —
  é só navegação)
- Como `/painel` e `/admin` já são protegidos pelo `middleware.ts` (decodifica o
  `refreshToken` e valida o `role`), não há necessidade de duplicar essa validação
  aqui — o link só *aparece* condicionalmente por UX, a proteção de acesso real já
  existe em outra camada
- Se por algum motivo o `role` mudar durante a sessão (ex: token expirou e o refresh
  trouxe dados diferentes), o link deve refletir isso automaticamente, já que
  `useAuth()` é reativo

## 5. Estados

Nenhum estado novo de loading/erro — o link só depende do `role` que já está disponível
no estado de autenticação carregado no momento em que o Header renderiza. Se
`useAuth()` ainda estiver carregando (`isLoading`), simplesmente não mostrar nenhum dos
dois links até resolver — evita um "flash" mostrando/escondendo o link.

## 6. Componentes Afetados

```
components/layout/header.tsx   # único arquivo a alterar — adicionar lógica condicional
                                 # de renderização do link, reaproveitando o padrão
                                 # visual do link "Lojas" já existente
```

Não é necessário criar componente novo — é uma adição pequena dentro do `Header` já
existente.

## 7. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. O componente Header já existe em
src/components/layout/header.tsx, já usa useAuth() (de
src/features/auth/hooks/use-auth.ts) para decidir entre mostrar o carrinho ou o botão
de login, e já tem um link "Lojas" apontando para /lojas.

Tarefa: adicionar ao Header um link condicional de acesso ao painel, baseado no campo
role do usuário autenticado (já disponível via useAuth()), seguindo o documento
"Spec: Acesso ao Painel a partir do Header".

Regras:
- role === 'Proprietário' ou role === 'Funcionário' → mostrar link "Painel da loja"
  apontando para /painel
- role === 'Admin' → mostrar link "Painel admin" apontando para /admin
- role === 'Cliente' ou usuário não autenticado → nenhum dos dois aparece
- Enquanto useAuth() estiver em isLoading, não mostrar nenhum dos dois (evita flash)

Responsividade — CRÍTICO, não quebrar o Header no mobile:
- Desktop (md: e acima): link em texto, ao lado do link "Lojas" já existente, mesmo
  padrão visual (classe hidden md:inline no texto)
- Mobile (abaixo de md:): NÃO repetir como texto — usar um ícone compacto do
  lucide-react (Store para colaborador, LayoutDashboard para admin) com aria-label
  descritivo ("Painel da loja" / "Painel admin"), no mesmo grupo dos outros ícones do
  Header (perto do ícone de busca), mesmo tamanho (size-5) e espaçamento (gap-3) já
  usados ali. Usar classe md:hidden no ícone. Não deve alterar a altura do Header nem
  causar quebra de linha em nenhum breakpoint, mesmo com a busca expandida
- Não duplicar nenhuma validação de acesso — /painel e /admin já são protegidos pelo
  middleware.ts existente, este link/ícone é só uma questão de navegação/descoberta

Não é necessária nenhuma chamada de API nova — o role já vem de useAuth().

Testar manualmente (ou via viewport de dev tools) em pelo menos 375px de largura,
garantindo que o Header não quebra com o ícone novo + busca fechada e + busca aberta.

Não implementar: menu hambúrguer novo, badge de notificação nesse link — fora do
escopo desta task.
```