# Vitrine Web — diretrizes vigentes

Este guia incorpora a consolidação de “Explorar lojas” de outubro de 2026 e substitui instruções anteriores conflitantes sobre /catalogo, cards e destino após autenticação. Consulte [implementação e verificação](explorar-lojas.md).

## Apresentações

A página comercial permanece como entrada geral para visitantes não autenticados, com tema escuro isolado, informações institucionais, benefícios e contato da plataforma. Não transformar a raiz anônima numa listagem.

A descoberta de lojas mantém fundo predominantemente branco e cabeçalho preto. Cada card representa uma loja com catálogo próprio: logo inteira em área quadrada neutra com margem, nome destacado, segmentos cadastrados, descrição completa e “Explorar loja”. Sem banner nos cards, círculo, preço, desconto, avaliações, carrinho ou corte de descrição. Loja sem logo usa apresentação neutra; sem segmento não recebe etiqueta fictícia.

O cabeçalho simplificado só se aplica à descoberta: marca, Explorar lojas, entrada/conta/carrinho e acesso aos painéis conforme a sessão. Informações institucionais e contato continuam na página comercial e no rodapé.

Dentro da loja, manter banners, identidade, catálogo, galeria, cartões de produto, categorias, tamanhos, quantidade, carrinho e atendimento existentes. Não implementar vídeo, prévia ao passar o mouse, busca global ou grades de produtos de lojas diferentes.

## Rotas e autenticação

| Acesso | Comportamento |
| --- | --- |
| /, visitante | Verifica a sessão e apresenta a página comercial |
| /, consumidor autenticado | /lojas |
| /, administrador ou colaborador | Painel correspondente ao papel efetivo |
| /lojas | Descoberta pública “Explorar lojas” |
| /catalogo | Redirect permanente para /lojas, com consultas compatíveis |
| /sobre e /contato | Informações comerciais públicas |
| /loja/:slug e /loja/:slug/produtos | Catálogo público da loja; links preservados |
| /produto/:id | Detalhe público, com tamanho/quantidade restauráveis pela URL |
| Login ou cadastro com retorno válido | Retoma o destino interno autorizado, preservando parâmetros e seleções |
| Autenticação sem retorno válido | /lojas para cliente; /admin ou /painel para os papéis correspondentes |

Não executar ações de carrinho ou pedido automaticamente após autenticação. Rejeitar destinos externos, endpoints, rotas desconhecidas, telas de autenticação e destinos proibidos ao papel. Manter a autorização efetiva na API.

## Busca e filtros

- Busca por lojas no conteúdo, com botão Filtrar acima dela.
- Painel acessível “Filtrar lojas”: segmentos da API, múltipla seleção, aplicar, limpar, fechar, teclado e mobile.
- Nenhum segmento: todas as lojas elegíveis; múltiplos: pelo menos um correspondente, sem lojas duplicadas.
- Busca e segmentos combinados na API antes da paginação, com contagem correta.
- Estado na URL e no cache; alterações retornam à primeira página. Filtros aplicados removíveis, carregamento, erro e nenhum resultado.
- Busca de produtos, categorias, subcategorias e contagens restritas à loja escolhida. Não reutilizar resultados de outra loja.

## Segmentos e dados

Segmentos representam tipos de loja; categorias representam produtos. Somente o administrador gerencia a lista de segmentos. Associação múltipla no cadastro e edição segue as permissões existentes para editar a loja. Exclusão de segmento associado é bloqueada com mensagem compreensível.

A migração da API é incremental. Preservar as duas lojas existentes e seus links, produtos, usuários e demais registros. Elas podem permanecer sem segmentos. Não criar exemplos nem classificar lojas automaticamente.

## Contato e responsabilidades

O lojista conduz pagamento, entrega e venda. Preservar atendimento local e o contato comercial já existente, sem formulário de envio adicional ou mensagens reais em testes. Não prometer recursos ausentes.

## Versionamento e verificação

Respeitar Next.js/React/Tailwind, Base UI, React Query, RHF/Zod e os padrões da API NestJS/Prisma. Reutilizar componentes e preservar alterações do usuário. Commits pequenos por finalidade, com revisão do conteúdo; sem push, deploy ou alterações de produção.

Verificar migração com dados preexistentes, associações/permissões, filtros/contagem/paginação, cards extremos, desktop/mobile, redirect legado, login/cadastro e isolamento de produtos. Registrar testes, evidências e limitações sem declarar cenários não exercitados.
