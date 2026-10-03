# Apresentação comercial e navegação pública

Implementação de 3 de outubro de 2026, conforme o guia e o HTML de referência do workspace.

- `/`: proposta da plataforma para lojistas de moda, uma vitrine cadastrada na API como exemplo contextualizado, benefícios, descoberta de lojas, fluxo de pedido e perguntas frequentes.
- `/sobre`: apresentação para lojistas, três passos, responsabilidade do vendedor e contato comercial existente em `/sobre#contato`.
- `/lojas`: busca de marcas, logo, banner e descrição. Sem preços ou produtos; ordem de cadastro da API. Segmento e cidade não fazem parte do contrato do diretório, portanto não há filtros inventados.
- `/loja/:slug`: navegação e identidade da loja, catálogo direto, apresentação, endereço, modalidades cadastradas e atendimento.
- `/loja/:slug/produtos`: catálogo local completo, compartilhando busca, filtros e paginação com a vitrine.
- `/produto/:id`: galeria, preço, tamanhos, quantidade, disponibilidade e carrinho, com a marca e navegação da loja proprietária.

O contato comercial já existente foi mantido e normalizado para o formato internacional: `https://wa.me/5516996064411`. O cadastro comum de consumidor não cria uma loja.

O carrinho reúne itens de uma loja. O cliente autenticado revisa a seleção, registra o pedido e abre a mensagem no WhatsApp. A loja combina pagamento, entrega e conclusão da venda. A plataforma não processa pagamentos.

O visual público é escuro fixo, com Arial na interface, Georgia nas marcas, fundo `#151515`, cabeçalhos `#0d0d0d`, superfícies `#242424`, texto `#f4f4f4`, secundário `#bcbcbc` e bordas `#424242`. Os tokens ficam em `.vw-theme`, em `src/styles/public.css`.

Não há controles de demonstração, lojas fabricadas, depoimentos, métricas ou promessas de recursos ausentes. Conteúdo de demonstração que já exista no banco continua identificado pela descrição do próprio lojista.

Consulte [repaginacao.md](repaginacao.md) para evidências, comandos e limitações.
