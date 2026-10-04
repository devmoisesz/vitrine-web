# Correção de escopo — catálogo original

Esta entrega substitui a aplicação do visual escuro ao catálogo na primeira repaginação. O [guia vigente](guia-repaginacao.md), também atualizado na raiz do workspace, registra as instruções mais recentes do usuário.

## Referência e recuperação

- A versão publicada em https://vitrineweb-app.vercel.app/ foi examinada no Chrome, incluindo a entrada e o catálogo da loja Linha.
- Base anterior à repaginação: `b794e7c`. Foram recuperados o cabeçalho preto original, `StoreBanner`, `StoreProductsBar`, `CategorySidebar`, cartões/diretório de lojas e campo de busca. O detalhe do produto voltou à estrutura original, com seus controles existentes.
- O cartão do produto conserva a correção de links separados do botão de carrinho e o feedback de sucesso/erro, sem alterar seu visual original.
- `CommercialLayout` e `CommercialHeader` isolam os estilos da landing e de `/sobre`. O layout público compartilhado não define tema. Catálogo, loja, produto e conta usam os tokens brancos originais.

## Navegação e dados

- Visitante na raiz: estado neutro enquanto a sessão é verificada; depois, landing escura com acessos ao catálogo, diretório e login, além de lojas participantes reais.
- Autenticado na raiz: `replace("/catalogo")`, sem renderizar a landing.
- Login normal: `/catalogo` para todos os papéis. Retorno interno explícito continua a ação solicitada; destinos externos, raiz e rotas de autenticação não causam ciclos.
- `/catalogo`: descoberta pública de lojas com os banners/logos originais e sem produtos/preços de vários lojistas.
- `/lojas`: diretório branco original. Links de ambas as entradas abrem diretamente os produtos da loja.
- `/loja/:slug` e `/loja/:slug/produtos`: mesmo catálogo local com banner, logo, categorias laterais, busca, produtos e atendimento. Nenhuma apresentação comercial intermediária.
- `/produto/:id`: galeria, tamanho, quantidade e carrinho originais, com vínculo ao catálogo e contato da loja. Trocar o produto reinicia suas seleções.
- Busca no cabeçalho: lojas fora do contexto de uma loja; produtos locais dentro dele. Busca/filtros alterados reiniciam a página. Links entre lojas não carregam filtros anteriores.
- A API real continua sendo consumida pelo proxy público restrito. Não há produtos globais filtrados no navegador. A chave de cache inclui loja, nome, categoria, subcategoria e página, sem reutilizar dados de outra loja.

## API e versionamento

Nenhuma alteração de endpoint, autorização, dados ou migração foi necessária nesta correção. `GET /stores` já pesquisa lojas. O repositório Prisma aplica `storeId`, status, busca e filtros antes de paginação e contagem em `GET /store/:slug/products`.

Front-end e API seguem nas branches `feat/repaginacao-vitrine` e `test/repaginacao-catalogo`. Versões mantidas em `0.1.0` e `0.0.1`, sem política de release que exija mudança para esta entrega local. Sem push, release ou deploy.

## Verificações

- TypeScript: `npx tsc --noEmit --incremental false` aprovado.
- Front-end: 21 testes aprovados em sessão, proxy público, WhatsApp e `catalog-navigation.test.mjs`. Os novos casos exercitam espera da sessão, destinos de login, prevenção de ciclos, chaves de cache e transporte dos filtros locais.
- API: os dois testes de `prisma-public-catalog.spec.ts` passaram novamente, incluindo consulta/contagem na segunda página e troca de loja.
- No navegador: a busca externa por Linha retornou a loja; a busca local por Off-White retornou somente sua camiseta; categoria Moda Masculina e subcategoria Jaqueta retornaram somente a jaqueta da Linha; produto e exigência de login com retorno ao produto foram conferidos.

- Build de produção: `npm run build` aprovado, incluindo TypeScript e geração das 32 páginas estáticas.
- ESLint: `npm run lint` aprovado, com seis avisos preexistentes de variáveis/imports não utilizados e nenhum erro.
- Navegador desktop e largura de 390 px: landing escura, catálogo/diretório brancos, banners/logos recuperados, categorias laterais no desktop e chips no móvel. A comparação identificou compressão do logo no cabeçalho móvel; a navegação passou para a segunda linha e foi conferida novamente.
- Acesso anônimo a `/catalogo`, `/loja/linha/produtos`, `/loja/vitrine-web` e ao detalhe de produto aprovado. A loja Vitrine Web exibiu somente seus dez produtos, sem carregar a busca e os filtros usados anteriormente na Linha.
- Paginação: a segunda página da Linha, que atualmente tem apenas dois produtos, apresentou estado vazio; voltar à página anterior restaurou os dois produtos. Consulta, contagem e deslocamento de uma segunda página com resultados foram cobertos no teste da API.
- Prévia do build disponível localmente em `http://127.0.0.1:3002`. Evidências no workspace: `.preview/correcao-temas-mobile.jpg` e `.preview/correcao-catalogo-desktop.jpg`. O HTML de conferência móvel é somente um artefato local e não integra o produto.

## Limitações da conferência

- Sem uma sessão real de teste, não foi possível concluir no navegador o login, a entrada autenticada na raiz e operações de carrinhos/pedidos. Destino normal do login, retorno explícito, prevenção de ciclos e ausência da landing durante a restauração da sessão foram verificados nos testes automatizados. A entrada anônima pelo botão de carrinho manteve o retorno ao produto após o login.
- A separação persistida de carrinhos entre lojas não foi exercitada com gravações nesta sessão. Seus componentes e contratos existentes foram preservados. Nenhum pedido ou mensagem foi enviado.
- Os dados publicados possuem menos de 40 produtos por loja; não foi possível conferir uma segunda página preenchida usando esses dados.
- Uma imagem de produto da loja Vitrine Web não carregou na captura final; o endereço vem do cadastro real. Os demais produtos, banners e logos carregaram. Não foram substituídos dados ou imagens cadastradas.

## Commits desta correção

| Repositório | Commit | Entrega |
| --- | --- | --- |
| Front-end | `e0f2df8` | Recuperação do catálogo original, isolamento comercial e rotas públicas. |
| Front-end | `7c4ea24` | Destino normal de login e validação do retorno interno. |
| Front-end | `aadb711` | Testes de entrada, cache por loja e consultas locais. |
| API | `29ff2b4` | Registro do escopo limitado e contratos preservados. |

Este registro e o guia são versionados em um commit próprio de documentação do front-end.
