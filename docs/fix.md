# Vitrine Web — Correções Prioritárias Pré-Deploy

> Consolidado a partir do relatório de revisão completa da aplicação. Ordenado pela
> mesma prioridade reportada pelo agente.

---

## 1. Retry no erro de carregamento do checkout

**Onde:** tela de checkout (`src/app/(account)/carrinhos/[cartId]/checkout/page.tsx`).

**Correção:**
```tsx
if (isError) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-sm text-gray-500">Não foi possível carregar o checkout.</p>
      <button type="button" onClick={() => refetch()} className="text-sm font-medium underline">
        Tentar novamente
      </button>
    </div>
  );
}
```
Confirmar que o `useQuery` do checkout expõe `refetch` e `isError` para o componente
usar — mesmo padrão já usado nas outras telas com estado de erro.

---

## 2. `<img>` → `next/image` (causa raiz: domínio remoto não autorizado)

**Diagnóstico:** o `next/image` recusa otimizar imagens de domínios externos não
declarados — como as imagens vêm do Cloudinary, sem essa configuração o componente
quebra em runtime, e o caminho mais rápido foi usar `<img>` puro como contorno.

**Correção — `next.config.js`:**
```js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // ajustar para o domínio exato do seu Cloudinary
      },
    ],
  },
};
```

Depois disso, trocar todos os `<img>` de produtos/carrinho/pedidos por `<Image>`
(componente `next/image`), como já especificado nas telas originais. Não é pra manter
`<img>` — era um contorno temporário, não uma decisão de design.

---

## 3. Feedbacks de erro/sucesso fora do padrão monocromático

**Correção:** buscar classes Tailwind de cor (`red-`, `green-`, `emerald-`, `rose-`) fora
de `globals.css` e substituir por peso tipográfico (`font-medium`/`font-bold`) e ícones
(`lucide-react`: `Check` para sucesso, `AlertCircle` para erro), mantendo só
preto/branco/cinza — mesma regra de design já seguida no resto do projeto.

---

## 4. ⚠️ Validar o formato exato de `role` no JWT (prioridade máxima)

**Risco:** ao longo do projeto, usamos grafias diferentes de papel em momentos
diferentes — `'FUNCIONARIO'`/`'PROPRIETARIO'` (decorators do backend) vs
`'Funcionário'`/`'Proprietário'` (confirmado verbalmente para o campo `role`). O formato
exato de `'Admin'` no JWT nunca foi confirmado literalmente. Um erro de grafia aqui
bloqueia administradores/colaboradores de acessar o próprio painel.

**Ação necessária:** decodificar um JWT real (ex: via [jwt.io](https://jwt.io), colando
só o token — nunca a chave privada) e confirmar a string exata do campo `role` para cada
papel (Admin, Funcionário, Proprietário).

**Correção defensiva temporária, até a confirmação** (`src/middleware.ts`):
```typescript
const userRole = (payload.role as string)?.toLowerCase();

if (isAdminRoute && userRole !== 'admin') {
  return NextResponse.redirect(new URL('/', request.url));
}

if (isPainelRoute && !['funcionário', 'proprietário', 'funcionario', 'proprietario'].includes(userRole)) {
  return NextResponse.redirect(new URL('/', request.url));
}
```
Comparação case-insensitive evita o pior cenário (admin trancado fora) enquanto a string
exata não é validada. Depois de confirmada, pode voltar para comparação estrita.

---

## 5. Build falhando por falta de acesso a `fonts.googleapis.com`

**Diagnóstico:** `next/font/google` baixa os arquivos de fonte durante o build. Se o
ambiente de build/CI não tem saída de rede para `fonts.googleapis.com`, o build quebra
nesse ponto.

**Solução recomendada — auto-hospedar as fontes localmente:**
1. Baixar os arquivos `.woff2` de Bodoni Moda, Inter e Lato direto do
   [Google Fonts](https://fonts.google.com) (botão "Download family")
2. Colocar em `public/fonts/`
3. Trocar `next/font/google` por `next/font/local`:
```tsx
import localFont from 'next/font/local';

const bodoniModa = localFont({
  src: '../public/fonts/bodoni-moda.woff2',
  variable: '--font-serif',
});
```
Repetir para Inter (`--font-sans`) e Lato (usada só no layout de `(auth)`). Isso elimina
qualquer dependência de rede externa durante o build, permanentemente.

**Alternativa mais simples (se o ambiente de deploy final tiver rede aberta, ex:
Vercel/Netlify):** não fazer nada — validar que o build funciona nesse ambiente
específico antes de assumir que o problema persiste em produção. Recomendo a solução 1
mesmo assim, por ser mais robusta e não depender de infraestrutura de terceiros no
momento do build.

---

## Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript + Tailwind v4 do marketplace
Vitrine Web. Uma revisão completa da aplicação apontou 5 correções prioritárias antes
do deploy, detalhadas no documento "Correções Prioritárias Pré-Deploy".

Aplique as 5 correções, na ordem:

1. Adicionar retry (via refetch do React Query) ao estado de erro do checkout —
   mesmo padrão já usado em outras telas do projeto.

2. Configurar remotePatterns no next.config.js para o domínio do Cloudinary usado
   pelo projeto, depois trocar todos os <img> de produtos/carrinho/pedidos por
   next/image (Image component). Não é para manter <img> como solução definitiva.

3. Buscar todas as classes Tailwind de cor (red-, green-, emerald-, rose-) usadas fora
   de globals.css em feedbacks de erro/sucesso, e substituir por peso tipográfico
   (font-medium/font-bold) + ícones lucide-react (Check para sucesso, AlertCircle para
   erro) — mantendo o padrão monocromático (preto/branco/cinza) do projeto.

4. CRÍTICO: em src/middleware.ts, tornar a comparação do campo `role` do JWT
   case-insensitive temporariamente (normalizar com .toLowerCase() e comparar contra
   variações em minúsculo, incluindo com e sem acento para Funcionário/Proprietário),
   para evitar bloqueio indevido de administradores/colaboradores enquanto a string
   exata do campo não é confirmada manualmente.

5. Trocar next/font/google por next/font/local para Bodoni Moda, Inter e Lato,
   hospedando os arquivos .woff2 em public/fonts/ — elimina a dependência de acesso a
   fonts.googleapis.com durante o build.

Após aplicar as 5 correções, rodar `next build` novamente e confirmar que passa sem
erros relacionados a essas 5 questões.
```