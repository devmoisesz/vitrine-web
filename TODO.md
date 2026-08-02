# TODO — Loop de renovação proativa do refresh token

Objetivo: manter o usuário logado sempre — quando o access token (15 min)
expirar, renovar via rota de refresh antes da expiração, mantendo também o
refresh_token em rotação contínua.

## Passos

- [x] 1. `src/lib/api-client.ts` — adicionar `subscribeToSessionExpired` (evento de sessão expirada)
- [x] 2. `src/lib/api-client.ts` — adicionar `getAccessTokenExpiry` (decodifica `exp` do JWT)
- [x] 3. `src/lib/api-client.ts` — `refreshSession`: sinalizar sessão expirada apenas quando já havia token ativo
- [x] 4. `src/features/auth/hooks/use-auth.tsx` — agendar refresh proativo (loop) baseado no `exp` do access token
- [x] 5. `src/features/auth/hooks/use-auth.tsx` — reagir ao evento de sessão expirada e limpar estado
- [x] 6. `src/features/auth/hooks/use-auth.tsx` — expor `refresh()` e `sessionExpired` no AuthContext
- [x] 7. Verificar lint/build (`npm run lint` e `npm run build`)
