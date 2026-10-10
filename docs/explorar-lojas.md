# Explorar lojas — entrega de outubro de 2026

## Comportamento

- A raiz anônima mantém a página comercial. O consumidor autenticado sem retorno válido entra em `/lojas`; administrador e colaboradores mantêm seus painéis.
- `/lojas` é a descoberta pública “Explorar lojas”. `/catalogo` redireciona permanentemente para ela, preservando nome, segmentos e página compatíveis. Não existe grade global de produtos.
- Cabeçalho preto simplificado apenas na exploração, com marca, acesso à descoberta e ações existentes de conta/carrinho. Institucional e contato ficam no comercial e nos rodapés.
- Cards mostram logo inteira em área quadrada neutra, nome, segmentos reais, descrição completa e “Explorar loja”. Não há banner, preços, avaliações, cortes de texto ou etiquetas fictícias. Sem logo, usa-se ícone neutro.
- Filtro acessível com múltipla seleção, aplicação, limpeza, Escape, contenção e retorno do foco. A busca continua no conteúdo.
- Estado compartilhável: `/lojas?name=Loja&segments=fitness,cosmeticos&page=2`. Nome e segmentos se combinam no servidor, com OU entre segmentos. A API devolve contagem e páginas de 20; o navegador não filtra apenas a página atual. Alterações de busca/filtro retornam à página 1. Chips permitem remover filtros.
- Segmentos são geridos em `/admin/segmentos`; associação no cadastro, na edição administrativa de segmentos da loja e em `/painel/loja`, respeitando permissões da API. Nenhum segmento ou loja é criado automaticamente.
- As rotas `/loja/:slug`, `/loja/:slug/produtos` e `/produto/:id` continuam públicas; busca e produtos permanecem dentro da loja.

## Retorno após autenticação

`authHref` e `loginDestination` validam rotas internas conhecidas e o papel efetivo, rejeitando destinos externos, endpoints, telas de autenticação e ciclos. O destino acompanha os links entre login/cadastro e a restauração da sessão.

A página de produto existente é uma página própria, não uma janela sobre o catálogo. O endereço restaura tamanho e quantidade por `size` e `quantity`, preserva os demais parâmetros e valida a seleção contra os tamanhos/estoque atuais. Atualizações de seleção usam o histórico nativo integrado ao Next para evitar perda em cliques rápidos. Após autenticar não se adiciona ao carrinho nem se executa pedido automaticamente.

## Componentes reutilizados

Mantidos o Header contextual, StoreGrid/StoreCard, StoreSearchInput, Pagination, Button/Input, Base UI Dialog, React Query, formulários RHF/Zod, APIs de edição de loja e controles de tamanho/quantidade/carrinho. O StoreBanner e o catálogo com categorias continuam internos a cada loja.

## Verificação local

- `npm test`: 36 testes aprovados de navegação, destinos, seleção, transporte de consultas, cache, segmentos, cards, sessão e isolamento.
- `npm run build`: aprovado, incluindo TypeScript e geração das 34 páginas. `npm run lint`: aprovado sem erros, com seis avisos preexistentes de variáveis/imports não utilizados.
- `npm run test:e2e`: 12 cenários aprovados, seis em Chrome desktop e os mesmos seis com viewport/emulação Pixel 7. Cobrem redirect, descrição longa, ausência de logo/segmentos, filtros por teclado, URL/recarregar/voltar, carregamento/erro/sem resultado, isolamento dos catálogos, login, cadastro, CRUD administrativo e associação múltipla.
- Capturas de exploração e filtro revisadas em desktop e mobile: sem recorte de logo/descrição e sem rolagem horizontal.
- A verificação de permissões e migração com banco real está na API, documentada em `backend/docs/segmentos.md`.

Para repetir os testes visuais, instale as dependências com `npm ci` e tenha Chrome instalado. Execute `npm run test:e2e`. O Playwright inicia serviços exclusivos em 127.0.0.1:3100 e :4101 e os encerra ao terminar. A API fictícia fica somente em memória e não acessa banco nem lê credenciais de produção. As portas precisam estar livres. Capturas e traces são gerados em `test-results/`, ignorado pelo Git e pelo ESLint.

## Aplicação e limites

Aplique primeiro a migração aditiva e a API conforme o guia do backend; depois disponibilize o front. Os registros atuais não são classificados automaticamente. Não execute seeds ou reset.

A verificação visual usa API fictícia e emulação mobile, não um aparelho físico. OAuth Google, serviços externos e o ambiente publicado não foram exercitados. O login Google usa o mesmo resolvedor de destino, mas depende da configuração/credenciais reais. Não houve push, deploy, mudanças de CI ou migração em produção.
