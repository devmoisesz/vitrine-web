# Vitrine Web — correção com escopo limitado

## Diretriz vigente

Este documento registra as instruções mais recentes do usuário, que substituem orientações conflitantes da repaginação anterior. A tarefa é acrescentar a landing comercial e ajustar navegação e buscas, preservando o catálogo original. Não é uma nova reformulação completa.

Referências:
- Catálogo publicado: https://vitrineweb-app.vercel.app/
- Base original do front-end no Git: `b794e7c`.
- `REFERENCIA_VISUAL_VITRINE_WEB.html`: referência somente para a landing comercial.

## Duas apresentações separadas

### Comercial
Manter a predominância preta/escura na landing e na apresentação para lojistas. Explicar o propósito da Vitrine Web, os recursos existentes, o cadastro assistido e o papel do lojista na venda. Apresentar lojas participantes com dados reais e entradas claras para **Acessar catálogo**, **Explorar lojas** e **Entrar**.

### Catálogo e exploração
Recuperar do Git a estrutura branca original: cabeçalho preto com logo central, banners largos, logos sobrepostos, categorias laterais em desktop e apresentação original dos produtos. Usar os componentes existentes de galeria, cartões, tamanhos, quantidade e carrinho. Mudar apenas o necessário para organizar as lojas e suas buscas.

O tema comercial não pode envolver catálogo, produto, carrinhos, pedidos, conta ou painel. Trocar somente as cores do catálogo redesenhado não atende ao escopo.

## Rotas e sessão

| Acesso | Comportamento |
| --- | --- |
| Raiz `/`, visitante | Aguarda a verificação da sessão e apresenta a landing comercial. |
| Raiz `/`, autenticado | Vai para `/catalogo`, sem exibir a landing durante a verificação. |
| `/catalogo` | Entrada pública de descoberta, com busca de lojas e banners/logos originais. |
| `/lojas` | Diretório público de lojas. |
| `/loja/:slug` | Produtos da loja diretamente, com identidade e atendimento existentes. |
| `/loja/:slug/produtos` | Catálogo local; link existente preservado. |
| `/produto/:id` | Detalhe público com apresentação original e identificação da loja. |
| Login normal | Destino `/catalogo`, para todos os papéis. |
| Login com retorno interno explícito | Retoma produto, carrinho ou rota protegida solicitada; rejeita destinos externos e ciclos de autenticação. |
| Links antigos de busca global | Levam ao catálogo de lojas com aviso de que a busca de produtos acontece dentro da loja. |

O catálogo continua público. Não introduzir passagem obrigatória por apresentação comercial da loja. Painéis permanecem disponíveis conforme o papel real; não alterar guards ou permissões para facilitar a navegação.

## Buscas e isolamento

- Fora de uma loja: pesquisar lojas, com identidade e acesso aos respectivos catálogos.
- Dentro de uma loja: pesquisar produtos da loja solicitada.
- Não consultar ou renderizar grade global de produtos/preços de diferentes lojistas.
- Categorias, subcategorias, busca, contagem e paginação devem respeitar o escopo no servidor.
- Manter a loja e todos os filtros na chave de cache. Não reutilizar resultados anteriores de outra loja.
- Trocar de loja com links sem filtros herdados. Limpar a página ao mudar a busca ou os filtros.
- Categorias de produtos ficam dentro da loja; a taxonomia existente pode ser compartilhada, mas resultados e contagens são locais.

## Funcionalidades preservadas

Manter autenticação, acesso direto, produto, estoque, tamanhos, quantidades, carrinhos separados por loja, pedidos, atendimento pelo WhatsApp, perfil, endereços e gestão. Não enviar pedidos ou mensagens reais durante verificações sem autorização específica.

A plataforma apresenta as lojas; o lojista vende. Não prometer pagamentos processados pela plataforma ou cadastro autônomo de loja quando não existem. Usar os dados já cadastrados; não inventar lojas, avaliações ou métricas.

## API

Verificar primeiro os contratos existentes:
- `GET /stores`: busca de lojas por nome/descrição e paginação.
- `GET /store/:slug`: dados públicos da loja.
- `GET /store/:slug/products`: produtos, busca, categorias, contagem e paginação da loja.
- `GET /products/:id`: detalhe e vínculo produto–loja.

Alterar a API somente se faltar uma garantia necessária. Não filtrar globalmente no navegador como substituto do escopo no servidor. Preservar endpoints globais por compatibilidade quando outros consumidores puderem existir. Não apagar dados nem criar migrações para recuperar o visual.

## Implementação e versionamento

- Usar a arquitetura Next.js existente, com estilos comerciais isolados em componentes próprios.
- Recuperar os componentes originais pelo histórico; conservar correções funcionais compatíveis.
- Repositórios independentes: respeitar branches, convenções e versões de cada um.
- Fazer commits pequenos por implementação, correção, testes ou documentação.
- Não alterar versões sem exigência do processo existente. Não publicar, fazer deploy, criar release ou push.
- Registrar os arquivos recuperados, ajustes necessários, testes, evidências e cenários não verificados.

## Validação

Conferir no navegador:
- Landing escura e catálogo predominantemente branco, comparado à versão publicada.
- Acesso público ao catálogo, lojas e produtos.
- Entrada autenticada na raiz e login normal levando ao catálogo, sem ciclos ou flash da landing.
- Busca externa retornando lojas e busca local retornando somente produtos da loja.
- Categorias, subcategorias, paginação, troca de loja e limpeza de filtros.
- Detalhes de produtos, carrinhos separados e atendimento.
- Desktop e celular, sem sobreposição ou rolagem horizontal indevida.

Executar tipos, lint, build e testes proporcionais, principalmente sessão, destinos de login, transporte de consultas e isolamento no servidor. Registrar claramente limitações de acesso, dados ou ambiente. Não declarar validação de cenários que não foram exercitados.
