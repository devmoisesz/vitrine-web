# Vitrine Web — Spec: Tela de Perfil do Usuário

## 1. Contexto

Rota: `src/app/(account)/perfil/page.tsx`. Área autenticada — protegida pelo mesmo padrão
das demais rotas de `(account)`. Página única com três seções empilhadas: **Dados
pessoais**, **Endereços**, **Segurança**.

Escopo: cliente (`Cliente`). `GET /me` também retorna `store_name`/`store_address` para
usuários com papel de loja (`Proprietário`/`Funcionário`) — **ignorar esses campos aqui**,
são do painel do lojista (fase 2), fora do escopo desta tela.

## 2. Contrato de API

```
GET /me
Resposta 200 (OutputGetProfileDto):
{
  user_name: string
  user_email: string
  user_role: string
  store_name?: string | null        // ignorar nesta tela
  store_address?: Address | null    // ignorar nesta tela
  user_address: Address[]
}
```

```
PUT /account/edit
Body: { name: string, email: string }
Resposta: 204
```

```
POST /address/register
Body: { label, cep, state, city, neighborhood, street, number, complement }
Resposta: 201
```

```
GET /me/addresses?page=
Resposta 200: Address[]
```

```
PUT /me/addressess/:addressId   // atenção ao nome exato da rota (typo existente na API)
Body: { label, cep, state, city, neighborhood, street, number, complement }
Resposta: 204
```

### ⚠️ Endpoint novo necessário: troca de senha

Não existe hoje. Contrato sugerido, seguindo o padrão do resto da API:

```
PATCH /account/password
Auth: JwtAuthGuard
Body: { currentPassword: string, newPassword: string }
Resposta: 204 (ou 400 se currentPassword não confere)
```

### ⚠️ Campo novo necessário em `GET /me`

Para decidir se a seção de senha aparece:

```
provider: 'LOCAL' | 'GOOGLE'   // ou has_password: boolean
```

Sem isso, o frontend não tem como saber se o usuário tem senha para trocar.

## 3. Seção: Dados Pessoais

- Campos: **nome** e **e-mail**, ambos editáveis, React Hook Form + Zod
- Validação: nome obrigatório, e-mail em formato válido
- Ao salvar: `PUT /account/edit`. Sucesso → mensagem de confirmação inline (toast ou texto
  temporário, sem `alert()`). Erro (ex: e-mail já usado por outra conta) → mensagem de erro
  no campo correspondente
- Botão "Salvar" fica desabilitado se nada foi alterado (evita chamada desnecessária)

## 4. Seção: Endereços

- Lista de cards, um por endereço: `label` em destaque + endereço completo formatado
  (`street, number - neighborhood, city/state - cep`)
- Botão **"+ Adicionar endereço"** abre um formulário (Dialog do Base UI) — mesmo
  formulário reaproveitado para criar e editar, diferindo só no endpoint chamado
  (`POST /address/register` vs `PUT /me/addressess/:addressId`)
- **Formulário do endereço:**
  1. Campo CEP primeiro, com autopreenchimento via ViaCEP (`https://viacep.com.br/ws/{cep}/json/`)
     ao completar 8 dígitos
  2. Campos `street`, `neighborhood`, `city`, `state` pré-preenchidos pela ViaCEP, mas
     **sempre editáveis** (CEP pode vir impreciso — não travar os campos)
  3. Campos `number` e `complement` sempre manuais (ViaCEP não retorna isso)
  4. Campo `label` (ex: "Casa", "Trabalho") — texto livre, obrigatório
- Sem endereços cadastrados: estado vazio com texto simples + botão de adicionar
- **Não há endpoint de exclusão de endereço na API atual** — não implementar botão de
  remover (evita construir UI para uma ação que não tem endpoint por trás)

## 5. Seção: Segurança (troca de senha)

- **Renderizar esta seção somente se `provider === 'LOCAL'`** (aguardando o campo novo em
  `GET /me`). Para contas Google, omitir completamente — não faz sentido pedir "senha
  atual" de quem nunca teve uma
- Campos: senha atual, nova senha, confirmar nova senha — React Hook Form + Zod
- Validação: nova senha e confirmação devem ser iguais; nova senha com regra mínima de
  força (definir junto ao backend, ex: 8+ caracteres)
- `PATCH /account/password`. Erro comum a tratar: senha atual incorreta → mensagem
  específica no campo "senha atual", não um erro genérico

## 6. Estados

- Loading inicial (`GET /me` + `GET /me/addresses`): skeleton simples nos três blocos
- Erro ao carregar perfil: mensagem + botão "Tentar novamente" (tela toda depende desses
  dados, não faz sentido mostrar formulário vazio)
- Sucesso ao salvar qualquer seção: confirmação inline temporária (ex: "Dados atualizados"
  por 3s), sem navegar para outra tela

## 7. Componentes

```
components/profile/
├── personal-data-section.tsx
├── address-list.tsx
├── address-form-dialog.tsx     # criar E editar, mesmo componente
├── address-card.tsx
└── password-section.tsx         # só renderiza se provider === 'LOCAL'

features/profile/
├── hooks/
│   ├── use-profile.ts           # GET /me
│   ├── use-update-profile.ts    # PUT /account/edit
│   ├── use-addresses.ts         # GET /me/addresses
│   ├── use-save-address.ts      # POST /address/register + PUT /me/addressess/:id
│   ├── use-change-password.ts   # PATCH /account/password (endpoint novo)
│   └── use-cep-lookup.ts        # ViaCEP
└── api/
    └── fetch-cep.ts
```

## 8. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
React Hook Form + Zod, componentes de UI seguindo Base UI + tailwind-variants +
tailwind-merge (Button, Input, Dialog já existem em src/components/ui/). useAuth() já
existe em features/auth/hooks/use-auth.ts.

Tarefa: implementar a tela de perfil em src/app/(account)/perfil/page.tsx, seguindo
rigorosamente o documento "Spec: Tela de Perfil do Usuário" (todas as seções).

Estrutura: página única com 3 seções empilhadas — Dados Pessoais, Endereços, Segurança.

Seção Dados Pessoais:
- Nome e e-mail editáveis, PUT /account/edit, confirmação inline ao salvar

Seção Endereços:
- Lista de cards a partir de GET /me/addresses
- Dialog (Base UI) reaproveitado para criar (POST /address/register) e editar
  (PUT /me/addressess/:addressId) — mesmo formulário nos dois casos
- Campo CEP com autopreenchimento via ViaCEP (https://viacep.com.br/ws/{cep}/json/),
  campos preenchidos automaticamente permanecem editáveis
- NÃO implementar exclusão de endereço — não existe endpoint para isso

Seção Segurança:
- Só renderizar se o campo `provider` do GET /me for 'LOCAL' (contas Google não têm
  senha) — se esse campo ainda não existir na resposta da API, implemente a seção
  normalmente mas deixe um comentário marcado TODO indicando a dependência
- Formulário de troca de senha via PATCH /account/password (endpoint pode ainda não
  existir no backend — implementar o client já preparado para quando existir)
- Tratar erro de "senha atual incorreta" com mensagem no campo correto, não genérica

Requisitos gerais:
- Estados de loading (skeleton), erro com retry, e sucesso (confirmação inline, sem
  alert() e sem navegação)
- Responsivo (mobile e desktop)
- Toda chamada HTTP usa credentials: 'include'

Não implementar: exclusão de conta, exclusão de endereço, upload de foto de perfil —
fora do escopo desta tela.
```
