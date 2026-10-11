# Sessão e consultas de perfil

Login por senha, Google e renovação usam `setSessionCookies`: `accessToken` e `refreshToken` são HttpOnly, SameSite Strict e Secure em produção. O cookie de papel é apenas um cache da interface; a autorização dos painéis continua consultando o papel atual na API.

Os consumidores de perfil público e do painel usam a mesma consulta `/me`, com validade de 60 segundos. A chave distingue usuário e sessão, mas permanece estável quando o access token é renovado. Não há nova consulta ao focar a janela. Links dos painéis não antecipam navegação protegida por prefetch.

Um `429` não dispara tentativas automáticas da consulta. O cliente respeita `Retry-After` e impede repetições imediatas. A renovação compartilha uma única requisição entre chamadas concorrentes e mantém o Web Lock usado pelas abas. Somente um `401` confirmado na renovação apaga a identificação em memória; falhas de rede, `429` e `5xx` permitem tentar novamente.

Quando a API não consegue autorizar uma navegação protegida por falha temporária, o proxy abre `/session/unavailable`, preservando o destino e os parâmetros. A tela aguarda o prazo indicado antes de habilitar nova tentativa. Ela aceita retorno somente para os painéis internos. Não há redirecionamento automático entre o painel e a página inicial.

## Verificação local

- `npm test`: cookies, cache, concorrência, permissões do proxy, cooldown e preservação de sessão.
- `npm run test:e2e`: navegador desktop e celular, API em memória e resposta Google simulada. Esses testes não acessam Neon nem autenticam uma conta Google real.
- `npm run lint` e `npm run build`.

Não há migração de banco para esta correção. O front e a API precisam receber as respectivas alterações para combinar a redução de consultas com o limite de `/me` por usuário verificado.
