# TODO — Redirecionamento pós-login por papel + proteção de rotas

## Causa raiz

- O claim `role` do JWT contém o enum Prisma (`USER`/`ADMIN`) — **não** distingue
  Cliente de Funcionário/Proprietário. O cookie `userRole` era gravado a partir
  desse claim, virando `"user"` para cliente e colaborador.
- A página de login mandava **todo** usuário não-admin para `/painel` → cliente
  via o painel do lojista.
- O middleware deixava `"user"` passar em `/painel` (só bloqueava `"cliente"`/`"admin"`).
- O cookie `userRole` não era gravado no login via Google.
- Admin sem cookie `userRole` correto era redirecionado para o catálogo.

## Fonte confiável

`GET /me` retorna o papel efetivo: `"Cliente" | "Admin" | "Proprietário" | "Funcionário"`.

## Passos

- [x] Criar `src/lib/session-role.ts` — resolver papel efetivo via `/me` (fallback JWT)
- [x] `login/route.ts` — gravar cookie `userRole` a partir do `/me` + retornar `user_role`
- [x] `google/route.ts` — gravar cookie `userRole` a partir do `/me` + retornar `user_role`
- [x] `refresh/route.ts` — manter/atualizar cookie `userRole` a partir do `/me`
- [x] `logout/route.ts` — apagar cookie `userRole`
- [x] `roles.ts` — adicionar `roleToDashboardPath(role)`
- [x] `authenticate.ts` — retornar `user_role` da sessão
- [x] `login/page.tsx` — rotear por papel: Admin → `/admin`, Proprietário/Funcionário → `/painel`, Cliente → `/`
- [x] `cadastro/page.tsx` — mesmo roteamento por papel (login com Google/registro)
- [x] `middleware.ts` — `/admin` exige `admin`; `/painel` exige colaborador/admin; cliente → `/`
- [x] Validar: `npx tsc --noEmit` sem erros
