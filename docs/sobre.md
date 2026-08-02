# Vitrine Web — Spec: Landing Page ("Para Lojistas") + Link no Header

## 1. Contexto

Nova rota pública: `src/app/(public)/para-lojistas/page.tsx`. Página institucional/
comercial — explica o problema que a Vitrine Web resolve, o valor que entrega, e reúne
contato para lojas interessadas em entrar na plataforma. Sem autenticação necessária,
acessível a qualquer visitante.

**Não é uma tela de produto** (sem dados de API, sem estado assíncrono) — é conteúdo
estático, focado em copy e design. A única interatividade é o botão de contato final.

## 2. Link no Header

- Texto: **"Sobre"**
- Sempre visível (diferente do link condicional de Painel/Admin — este aparece pra
  todo mundo, logado ou não), no mesmo grupo do link "Lojas" já existente
- Desktop: texto normal. Mobile: mesmo texto (é curto o suficiente para não repetir o
  problema de espaço que o link de Painel/Admin tinha — mas se o Header já estiver
  apertado depois dessas duas adições, considerar meter os três — Lojas, Para lojistas,
  Painel — atrás de um menu compacto único no mobile, em vez de três ícones soltos)

## 3. Direção de Design

**Mantendo o minimalismo do resto do site:** preto/branco/cinza, Bodoni Moda nos
headings, Inter no corpo, bastante espaço em branco — **nada de gradientes, cores de
marketing, ilustrações coloridas ou elementos "vendedores" chamativos**. A elegância
editorial já estabelecida *é* o argumento de venda (mostra o padrão visual que a loja
do lojista também vai ter).

Diferença permitida em relação ao resto do site: aqui pode ter mais **hierarquia
tipográfica ousada** (títulos bem grandes, contraste de peso) do que nas telas
transacionais (catálogo, carrinho) — é uma página de "ler e se convencer", não de
"executar uma tarefa rápida".

## 4. Estrutura de Conteúdo (seções, em ordem)

### 4.1 Hero
- Título grande (serif): algo como *"Sua loja merece mais que um checkout genérico."*
  ou reaproveitar o tom da pergunta que você mandou — *"Quer entender como a Vitrine
  Web pode ajudar sua loja?"* como sub-headline abaixo do título principal
- Um CTA logo aqui (âncora para a seção de contato, final da página)

### 4.2 O Problema
Baseado no contexto real do projeto: lojistas de moda enfrentam taxas altas de
e-commerces tradicionais, burocracia de carrinho/checkout, e distância do cliente —
enquanto o consumidor de moda quer tirar dúvida sobre caimento, tecido e tamanho, coisa
que nenhum checkout automatizado resolve bem.

### 4.3 A Solução / Como Funciona
3 passos simples (formato numerado ou ícones simples, sem ilustração pesada):
1. Sua loja ganha uma vitrine dentro do catálogo unificado
2. O cliente descobre, navega, escolhe
3. A conversa e a venda continuam no WhatsApp, do jeito que já funciona

### 4.4 Valor / Benefícios
Lista objetiva (bullets, tipografia — não ícones coloridos):
- Sem taxa por venda
- Sem gestão de carrinho/pagamento online
- Continua no controle da negociação e do relacionamento com o cliente
- Vitrine profissional, sem precisar construir um site próprio

### 4.5 Contato para Lojas Interessadas
- Botão/link direto — **recomendo WhatsApp ou e-mail simples, sem formulário com
  backend** (evita criar um endpoint novo só para isso; se preferir capturar os leads
  de forma estruturada no futuro, dá pra evoluir depois)
- CTA final, ex: *"Quer colocar sua loja na Vitrine Web? Fale comigo."* + botão que
  abre `wa.me/16996064411` ou `mailto:`

## 5. Componentes

```
app/(public)/para-lojistas/page.tsx

components/landing/
├── landing-hero.tsx
├── landing-problem-section.tsx
├── landing-how-it-works.tsx
├── landing-benefits.tsx
└── landing-contact-cta.tsx
```

Conteúdo estático — sem hooks de data-fetching, sem estados de loading/erro/vazio (não
há chamada de API nesta página).

## 6. Ajuste no Header

```
components/layout/header.tsx   # adicionar o link "Para lojistas" ao lado de "Lojas"
```

## 7. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css (preto/branco/cinza,
Bodoni Moda para headings, Inter para corpo). O Header já existe em
src/components/layout/header.tsx e já tem um link "Lojas".

Tarefa 1: implementar a landing page em src/app/(public)/para-lojistas/page.tsx,
seguindo rigorosamente o documento "Spec: Landing Page (Para Lojistas)". Página de
conteúdo estático (sem chamadas de API), com 5 seções em ordem: Hero, O Problema, Como
Funciona (3 passos), Benefícios (lista), Contato (CTA final com link wa.me ou mailto —
usar um placeholder óbvio tipo SEU_NUMERO_AQUI para eu preencher depois).

Direção de design CRÍTICA: manter o minimalismo do resto do site — preto/branco/cinza,
SEM gradientes, SEM cores de marketing, SEM ilustrações coloridas. Pode ter hierarquia
tipográfica mais ousada que as telas transacionais (títulos grandes), mas a paleta e a
tipografia continuam as mesmas do projeto inteiro.

Tarefa 2: adicionar ao Header um link "Para lojistas" apontando para /para-lojistas,
ao lado do link "Lojas" já existente, sempre visível (não depende de autenticação nem
de role — diferente do link de Painel/Admin, se esse já tiver sido implementado).
Testar em mobile (375px) que o Header não quebra com mais esse item — se já estiver
apertado por causa de outros links condicionais, avaliar agrupar os itens de navegação
extras (Lojas, Para lojistas, Painel) em um menu compacto único no mobile em vez de
itens soltos.

Não implementar: formulário de contato com backend, blog ou outras páginas
institucionais — fora do escopo desta task.
```