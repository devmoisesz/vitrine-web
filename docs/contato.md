# Contato comercial sem formulário

Implementação de 4 de outubro de 2026, conforme o pedido mais recente do usuário.

## Página e navegação

- `/contato` é uma rota pública, sem redirecionamento ou restrição para usuários autenticados.
- Reutiliza `CommercialLayout`, `CommercialHeader`, os ícones Lucide e a tipografia comercial. Duas colunas no desktop; uma coluna até 760 px, com painel de WhatsApp após os quatro blocos explicativos.
- Os estilos adicionais ficam em `src/styles/contact.css`, sempre dentro de `.vw-theme`. O painel branco tem contraste próprio e foco escuro visível. Não há mudança nos tokens globais ou no visual branco do catálogo.
- Conteúdo integral fornecido pelo usuário, sem transformar títulos explicativos em links.
- `Contato` aparece nos menus comercial e do catálogo e no rodapé comercial. Chamadas da home e de `/sobre` apontam para `/contato`. O fragmento antigo `/sobre#contato` permanece como entrada compatível com um link para a página própria.
- O acesso ao painel de usuários colaboradores continua disponível pelo componente `MerchantLink`. Autenticação, raiz autenticada e destino do login não foram modificados.

## Destino comercial

Número reutilizado: **+55 (16) 99606-4411**. A origem é `LandingContactCta` no commit anterior à repaginação `b794e7c`, onde já era usado para interessados na solução da plataforma. O número não é lido da API de lojas nem de uma loja participante.

Mensagem inicial:

> Olá! Gostaria de conhecer melhor a Vitrine Web e entender como funciona para minha loja.

A URL é montada com `buildWhatsappUrl`, que normaliza o telefone e codifica a mensagem com `encodeURIComponent`. O link usa `target="_blank"` e `rel="noopener noreferrer"`. Não foi aberta ou enviada uma conversa real durante a conferência.

Não há formulário, endpoint de envio, armazenamento de mensagens, nova dependência ou alteração na API. A versão do front-end permanece `0.1.0`; sem push, release ou deploy.

## Verificação

- `npm run build`: aprovado, incluindo TypeScript e geração das 33 páginas estáticas; `/contato` consta como página estática pública.
- 21 testes existentes aprovados: sessão, destinos do login, catálogo público e montagem do WhatsApp.
- `npm run lint`: sem erros, com seis avisos preexistentes em arquivos não alterados.
- No Chrome: acesso direto, navegação ao contato pelo catálogo, pelo menu da landing e pelo rodapé da landing; conteúdo e ausência de formulário; endereço, mensagem, destino em nova aba e proteções do link de WhatsApp.
- Desktop e viewport móvel de 390 × 844: duas colunas no desktop, uma coluna no móvel, textos legíveis e painel após os blocos. Sem rolagem horizontal. Menu do catálogo também conferido em 768 e 850 px.
- Navegação por Tab e Shift+Tab até o WhatsApp: foco visível, escuro sobre o painel branco. Botão com pelo menos 56 px de altura e texto que quebra no móvel.
- A raiz anônima continua mostrando a landing; o catálogo continua branco após sair da área comercial. O código e os testes dos redirecionamentos existentes permanecem intactos.

Limitação: não houve sessão autenticada real para conferir manualmente `/contato`, a raiz autenticada e o login completo. A página não possui guard de autenticação; os testes existentes verificam os redirecionamentos da raiz e do login. Houve demora temporária da API pública durante a conferência do catálogo, seguida de respostas 200; a página de contato não depende dessa consulta.

## Evidências e commits

- Capturas locais do build: `.preview/contato-desktop.jpg` e `.preview/contato-mobile.jpg`, na raiz do workspace.
- Prévia local: `http://127.0.0.1:3002/contato`.
- `7735603`: página comercial sem formulário e estilos isolados.
- `380d3ec`: links de contato nos menus, rodapé e chamadas comerciais.
- Este registro, o guia e as referências de navegação são versionados em um commit separado de documentação.
