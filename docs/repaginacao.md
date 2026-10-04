# Repaginação pública — diagnóstico e entregas

## Contato próprio — 4 de outubro de 2026

A área comercial agora possui `/contato`, sem formulário: quatro motivos para conversar com a plataforma e painel branco com link direto ao WhatsApp comercial existente. Os menus da landing e do catálogo, o rodapé comercial e as chamadas de contratação levam à nova página. O catálogo branco, os contatos dos lojistas e os redirecionamentos de autenticação foram preservados. Consulte [a implementação e a validação do contato](contato.md).

> Registro histórico da primeira implementação. O escopo visual e as rotas descritos abaixo foram substituídos pela [correção do catálogo](correcao-catalogo.md) e pelo [guia vigente](guia-repaginacao.md): landing escura isolada, catálogo branco original e entrada autenticada em `/catalogo`.

Referências: `GUIA_REPAGINACAO_VITRINE_WEB.md` e `REFERENCIA_VISUAL_VITRINE_WEB.html`, na raiz do workspace. O conteúdo autoral do iframe define o visual; o invólucro e os controles de demonstração ficam fora do produto.

## Diagnóstico (3 de outubro de 2026)

- Front-end: Next.js App Router, React Query, Tailwind 4. Base `main` em `b794e7c`, sem alterações locais. Branch de trabalho: `feat/repaginacao-vitrine`.
- API: NestJS/Prisma. Base `dev` em `11669bf`, sem alterações locais. Repositórios independentes, sem política de release automatizada ou tags existentes. Versões atuais: front-end `0.1.0`, API `0.0.1`.
- Público: lojistas de moda. Somente o administrador cria lojas. O CTA comercial deve usar o contato existente em `/sobre`; cadastro de cliente não cria loja.
- Fluxo: catálogo público → produto → login para adicionar → carrinho separado por loja → registro de pedido → WhatsApp do lojista. Não há processamento de pagamento online.
- `/stores` fornece marcas, descrição, logo e banner, sem produtos. Não fornece segmento ou cidade; não serão inventados filtros ou dados.
- `/store/:slug` fornece apresentação, imagens, WhatsApp, endereço e modalidades. `/store/:slug/products` aplica `storeId`, filtros e status antes da paginação e da contagem no Prisma.
- `/products/:id` fornece o vínculo com a loja. Os endpoints globais `/products` e `/home/stores` serão preservados por compatibilidade; suas chamadas sairão da experiência pública.
- Autenticação: preservar sessão, guards, acesso direto público e distinção Cliente/Admin/Proprietário/Funcionário.

## Entregas e dependências

1. Home comercial e base visual escura, com comparação no navegador antes das demais telas.
2. `/sobre`, contato, diretório e tratamento de links antigos de busca global.
3. Vitrine, busca local, categorias, paginação e produto com identidade da loja.
4. Verificações, documentação e commits por entrega validada. Sem push, release ou deploy.

Nenhuma nova API ou migração é necessária com os contratos disponíveis. O tema ficará restrito à experiência pública; o painel e a administração mantêm seus tokens.

## Riscos concretos e validação

- O hook local reutiliza dados anteriores indiscriminadamente; corrigir para não mostrar produtos de outra loja.
- O catálogo local ainda não oferece campo de busca próprio; integrar ao mesmo contrato já filtrado no servidor.
- Referência usa lojas fictícias: substituir por dados reais e estados de carregamento, vazio e erro.
- API hospedada pode demorar a responder; a comunicação comercial deve continuar acessível.
- Validar lint, tipos, build e teste de sessão; conferir home, diretório, loja e produto em desktop e celular; não enviar pedidos ou mensagens reais.
- Avaliação de compreensão com pessoas externas permanece pendente; conferência técnica não equivale à validação com usuários.

## Resultado implementado

- `/`: apresentação comercial com composição e paleta do HTML, exemplo alimentado por `/stores`, benefícios, funcionamento, perguntas frequentes e contato comercial. A loja demonstrativa cadastrada na API mantém sua identificação como demonstração.
- `/sobre`: proposta para lojistas, etapas do cadastro assistido e contato existente pelo WhatsApp. O CTA não cria conta de consumidor como se ela fosse uma loja.
- `/lojas`: busca de marcas, banners, logos, descrições, ordenação de cadastro explícita e paginação de 20 lojas. Sem produtos ou preços.
- `/loja/:slug` e `/loja/:slug/produtos`: identidade própria, catálogo imediato, busca por nome/descrição, categorias/subcategorias e paginação de 40 produtos. Sobre, endereço, entrega, pagamento e WhatsApp usam apenas os dados disponíveis.
- `/produto/:id`: identidade e navegação da loja, fotos, preço, tamanho, quantidade e carrinho existentes. Entrar para adicionar mantém o retorno ao produto.
- Links antigos `/?name=...`, `categoryId`, `subcategoryId` ou `page` levam a `/lojas?origem=busca-global`, com explicação do novo caminho.
- Cache inclui a loja e todos os filtros. Não há reaproveitamento de resultados anteriores entre lojas. Seleções de produto e busca são reiniciadas quando o contexto muda.
- Removidos componentes, hooks e chamadas obsoletos de catálogo global e da antiga landing. Endpoints da API continuam disponíveis para outros consumidores.
- Cabeçalho de conta conserva menus, carrinhos, saída e acesso ao painel conforme o papel autenticado. O tema fica restrito à área pública e ao cabeçalho compartilhado; conteúdos do painel, administração e conta mantêm seus estilos.

### Integração pública

A API hospedada permite apenas determinadas origens CORS. A prévia em outra porta revelou a falha das consultas diretas do navegador. Foi adicionado `/api/catalog/[...path]`, Route Handler do Next.js, com lista restrita de leituras públicas (`stores`, `categories`, `subcategories`, loja e produto individual), timeout e tratamento de erro. Não encaminha cookies ou tokens e preserva `X-Total-Count`. Busca global e caminhos administrativos não são aceitos.

O servidor usa a API real definida por `NEXT_PUBLIC_API_URL`; nenhum resultado é simulado ou persistido em dados locais. Esta mudança não depende de deploy, migração ou nova versão da API. Regras de autenticação e endpoints de escrita existentes foram preservados.

### Conferência visual e funcional

A home foi comparada com o conteúdo autoral do HTML antes de aplicar o padrão às demais páginas. Conferência no Chrome em desktop (1536 px) e em quadros móveis de 390 px, com as mesmas larguras para referência e implementação. Cor de fundo `rgb(21,21,21)`, título Arial de 52 px com entrelinha de 55,12 px em desktop, proporção das colunas e espaçamentos foram comparados visualmente e pelo DOM.

Correções após a comparação: altura e entrelinha dos botões, altura das imagens do catálogo, posição de “Entrar” no cabeçalho móvel e exibição integral dos banners no diretório. Foram preservadas as diferenças exigidas pelo produto: imagens/dados reais, preços locais, conta/carrinho, filtros funcionais e conteúdo adicional de funcionamento e dúvidas. Controles de alternância, arredondamento e scripts da demonstração não foram incorporados.

Fluxos conferidos no navegador:

- Home, página para lojistas, diretório, loja e produto em desktop e celular.
- Busca de lojas sem resultados; busca local sem resultados e limpeza de filtros.
- Categoria e subcategoria local: a seleção de Jaqueta na loja Linha retornou a jaqueta cadastrada.
- Troca de Linha para Vitrine Web pelo diretório, sem filtros ou produtos anteriores.
- Links diretos públicos; seleção de tamanho e redirecionamento para login com retorno ao produto ao adicionar ao carrinho.
- Link antigo de busca e mensagem de loja inexistente com opção de voltar/tentar novamente.
- Contato com número normalizado e mensagem preparada, sem abrir envio a um lojista.

### Limites e publicação

- A API remota apresentou demora em algumas consultas. A interface oferece carregamento, erro e nova tentativa; a apresentação comercial permanece acessível.
- Os dados atuais não atingem duas páginas de produtos por loja. O isolamento antes da paginação e contagem foi verificado por testes do repositório Prisma na API, incluindo a segunda página.
- Fluxos autenticados de compra, pedidos e gestão não foram exercitados ponta a ponta com contas reais. Nenhum pedido ou mensagem foi enviado; essa conferência deve usar ambiente e contas de teste antes da publicação.
- Avaliação de compreensão com pessoas externas continua pendente.
- Versões mantidas: front-end `0.1.0`, API `0.0.1`. Não existe política de release que exija alteração nesta entrega local. Sem tags, push, release ou deploy.

## Verificações técnicas finais

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Aprovado, sem erros. Seis avisos prévios de variáveis/imports não usados em `products-table`, `product-image-card`, `product-image-manager` e `features/cart/api/cart`. |
| `npx eslint src/features/catalog/components/category-chips.tsx` | Aprovado após o ajuste final de filtros e `aria-pressed`. |
| `npx tsc --noEmit --incremental false` | Aprovado; tipos novamente verificados no build final. |
| `npm run build` | Aprovado no Next.js 16.2.12; 31 páginas estáticas geradas e rotas dinâmicas compiladas. |
| `node --test test/session-security.test.mjs test/public-catalog.test.mjs test/whatsapp.test.mjs` | 16 testes aprovados: sessão/autorização, isolamento do proxy público, falhas da API e telefone brasileiro. |
| API: `pnpm test` | 74 arquivos, 496 testes aprovados. Dois novos casos verificam escopo da loja em filtros, contagem e paginação. |
| `git diff --check` | Sem erros de whitespace. |

Na API, ESLint 9 não encontra `eslint.config.*` no repositório. A limitação e os testes executados estão em `backend/docs/repaginacao.md`, no workspace. Nenhuma regra de produção da API foi alterada.

## Commits da implementação

Front-end, branch `feat/repaginacao-vitrine`:

| Commit | Entrega |
| --- | --- |
| `5093c13` | Diagnóstico e sequência de trabalho. |
| `f596254` | Proxy público do catálogo e testes de integração. |
| `c2a9ce0` | Ajuste do carregador de testes às regras de lint. |
| `6ba8d35` | Home e base visual, comparadas antes da expansão. |
| `9095d23` | Diretório de marcas e página para lojistas. |
| `fa776c7` | Identidade da loja, catálogo local e produto. |
| `40023f9` | Normalização dos telefones do WhatsApp. |
| `27c3cc5` | Remoção do código público global sem consumidores. |
| `bbb5936` | Ajustes visuais finais, modalidades da loja e filtros acessíveis. |

API, branch `test/repaginacao-catalogo`: `2ca7f8a`, testes de isolamento da consulta pública por loja. A documentação de encerramento foi registrada em commits próprios após as implementações acima.

## Evidências locais

No workspace, fora dos dois repositórios: `.preview/home-final.jpg` e `.preview/comparacao-home-mobile.jpg`. A comparação móvel usa quadros de 390 px; o invólucro de navegação da referência foi ocultado somente na cópia temporária para alinhar as telas. Os arquivos originais de referência não foram alterados.

A prévia de produção foi iniciada em `http://127.0.0.1:3002`. A consulta aos dados reais requer rede; o processo restrito foi reiniciado com a permissão de rede do ambiente para concluir a verificação.
