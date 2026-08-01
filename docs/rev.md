# Vitrine Web — Prompt de Revisão Completa da Aplicação

## Como usar

Cole o conteúdo da seção "Prompt" abaixo no agente (Claude Code ou equivalente), com
acesso ao repositório completo (frontend e, se possível, backend). Peça o relatório
estruturado no mesmo formato usado na análise de endpoints não consumidos.

---

## Prompt

```
Contexto: Vitrine Web é um marketplace de roupas (Next.js 14 App Router + TypeScript +
Tailwind v4 no frontend, NestJS + Prisma no backend). Todas as telas do MVP (Cliente,
Admin, Painel do Lojista) já foram implementadas. Preciso de uma auditoria completa
antes de considerar o projeto pronto para produção.

Faça uma revisão sistemática cobrindo as categorias abaixo. Para cada item, reporte um
status (✅ ok / ⚠️ atenção / ❌ problema) e uma observação objetiva — mesmo formato do
relatório de endpoints não consumidos que você já gerou antes.

## 1. Autenticação e Segurança

- access_token é mantido em memória (contexto/estado), nunca em localStorage ou
  sessionStorage — buscar qualquer uso de localStorage/sessionStorage relacionado a
  token ou dados sensíveis
- Toda chamada HTTP para o backend usa credentials: 'include'
- middleware.ts protege corretamente /admin/* (role === 'Admin') e /painel/*
  (role === 'Funcionário' || role === 'Proprietário') sem flash de conteúdo protegido
- Telas exclusivas de Proprietário (Funcionários, Dados da Loja) têm verificação
  client-side além do middleware amplo, redirecionando Funcionário que tentar acessar
- Nenhuma rota client-side confia só na ausência de UI para "esconder" uma ação —
  toda ação sensível também deve falhar corretamente se a API retornar 401/403
  (não apenas assumir que o botão não vai aparecer)
- Formulários de senha (cadastro, perfil) nunca logam a senha no console nem a
  mantêm em estado depois do submit

## 2. Consistência de Contrato de API

Comparar as chamadas reais do frontend contra os documentos de spec já existentes no
repositório (arquivos vitrine-web-tela-*.md e vitrine-web-painel-*.md, se estiverem
versionados, ou contra o que for encontrado no backend):
- Nomes de campos batem exatamente com o que os endpoints esperam (atenção especial:
  name_category/name_subcategory no criar produto vs newCategory/newSubcategory no
  editar — são schemas diferentes, meio comum errar isso)
- Campos como `size` (não `selectedSize`) no POST de adicionar ao carrinho
- Tratamento correto de respostas sem corpo (204) — nenhum código tentando fazer
  response.json() em uma resposta vazia
- Headers de erro tratados de forma específica onde documentado (ex: senha atual
  incorreta na troca de senha, e-mail já cadastrado, owner_email sem conta associada)

## 3. Estados de UI

Para cada tela com dados assíncronos (praticamente todas): confirmar que existem os
três estados básicos implementados, não só o caminho feliz:
- Loading (skeleton, não apenas um spinner genérico desconectado do layout final)
- Erro (mensagem + ação de retry, nunca uma tela em branco ou crash)
- Vazio (mensagem apropriada ao contexto, não a mesma mensagem genérica em todo lugar)

Atenção a paginação: como vários endpoints ainda não retornam total de páginas, os
componentes de paginação devem estar no "modo degradado" (anterior/próxima) de forma
consistente — verificar se algum ficou mostrando números de página quebrados ou
placeholder incorreto.

## 4. Responsividade

- Header: busca expansível, categorias em chips no mobile / sidebar no desktop
  (breakpoint consistente com o resto do projeto)
- Sidebars do Admin e do Painel do Lojista colapsam corretamente no mobile
  (confirmar que não ficam cortadas ou sobrepostas)
- Grids de produto: 2 colunas mobile, 3-4 desktop, sem overflow horizontal

## 5. Design System / Tokens

- Nenhuma cor hardcoded fora dos tokens definidos em globals.css (@theme) — buscar
  hex codes soltos no código (#fff, #000, rgb(...)) fora do arquivo de tokens
- Componentes de components/ui/ seguem o padrão: named export, data-slot,
  ComponentProps + VariantProps, twMerge, sem forwardRef
- Fonte Lato aplicada só nas telas de login/cadastro, resto do site em
  Bodoni Moda (headings) + Inter (corpo) — confirmar que não vazou pra outras telas
- Estados de erro/sucesso usam peso tipográfico e ícones, não cores de sistema
  (vermelho/verde) — confirmar que essa regra do design monocromático foi seguida

## 6. Regras de Negócio Críticas (re-checar contra requirements.md)

- Estoque de produto é único (não por tamanho) — nenhuma tela deve sugerir estoque
  individual por tamanho
- Carrinho: um por loja, criado automaticamente no primeiro item, deletado quando
  esvaziado
- Produto sem imagem: fluxo de cadastro redireciona automaticamente para a gestão de
  imagens (produto só é ativado pelo backend quando a primeira imagem é enviada)
- Produto/loja desativados nunca aparecem em buscas públicas
- Checkout: pedido é registrado ANTES de abrir o WhatsApp, nunca depois — se o registro
  falhar, o WhatsApp não deve abrir
- Endereço de usuário: múltiplos permitidos. Endereço de loja: só um (nunca uma lista)

## 7. Performance e Bundle

- Bundle de /admin e /painel não vaza para o bundle do site público (checar
  next build output ou similar — componentes de admin não devem aparecer no
  JS carregado por um visitante anônimo na Home)
- Imagens usam next/image (não <img> solto) nas telas onde isso foi especificado
- Nenhum useEffect com fetch direto que deveria estar usando TanStack Query
  (duplicação de lógica de cache/loading)

## Formato do relatório

Para cada categoria acima, uma tabela:

| # | Item | Status | Observação |
|---|---|---|---|

Ao final, um resumo: quantos itens ✅, quantos ⚠️, quantos ❌, e uma lista priorizada
dos ❌ que merecem correção antes de qualquer deploy em produção.
```