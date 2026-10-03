# Repaginação pública — diagnóstico e entregas

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

Resultados e commits serão registrados ao concluir cada entrega.
