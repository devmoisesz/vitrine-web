# Vitrine Web — Spec: Funcionários (Painel do Lojista)

## 1. Contexto

Rota: `src/app/painel/funcionarios/page.tsx`. Acessível **só por `Proprietário`** — a
única tela do painel além de "Dados da Loja" com essa restrição (Funcionário não gerencia
outros funcionários).

## 2. Contrato de API

```
GET /store/:slug/employees?page=
Auth: PROPRIETARIO
Resposta 200: [{ "id": "...", "name": "...", "email": "..." }]

(campo "id" precisa estar presente — ver documento de pendências da API; sem ele o
botão de remover não funciona)
```

```
POST /stores/:slug/collaborators
Auth: PROPRIETARIO

Body: { name, email, password, role }

caso usuario ja está cadastrado na plataforma e vai apenas promover para funcionario ou proprietario tanto faz a senha, exiba uma mensagem tipo essa de forma mais profissional e formal

Resposta: 201

Assumindo role sempre "FUNCIONARIO" nesta tela (Proprietário cadastra Funcionário, não
outro Proprietário) — confirmar se o backend aceita/espera outro valor aqui.
```

```
DELETE /store/:slug/delete/:employeeId
Auth: PROPRIETARIO
Resposta: 204
```

## 3. Regras de Negócio

- **Só Proprietário acessa esta tela** — reforçar tanto na sidebar (item já condicional,
  definido no dashboard) quanto na própria página (redirecionar Funcionário que tentar
  acessar via URL direta)
- **A senha é definida pelo Proprietário no cadastro**, não pelo próprio funcionário —
  diferente do fluxo de conta de cliente. Exibir aviso claro após o cadastro: *"Compartilhe
  este e-mail e senha com o funcionário para o primeiro acesso."*
- **Remoção é uma ação destrutiva** — exige confirmação (dialog) antes de chamar o DELETE

## 4. Layout

```
┌──────────────────────────────────────────┐
│  Funcionários          [+ Cadastrar]       │
├──────────────────────────────────────────┤
│  Nome           E-mail              Ações  │
│  João Silva     joao@email.com      Remover│
│  Maria Souza    maria@email.com     Remover│
└──────────────────────────────────────────┘
```
- Tabela simples (nome, e-mail, ação de remover)
- Botão "+ Cadastrar" abre um Dialog (Base UI) com o formulário de novo funcionário

### Formulário de cadastro (Dialog)
- Campos: nome, e-mail, senha — React Hook Form + Zod
- Ao submeter com sucesso: fecha o dialog, mostra o aviso de compartilhar credenciais
  (seção 3), atualiza a tabela

## 5. Estados

- Loading: skeleton de linhas de tabela
- Vazio: "Nenhum funcionário cadastrado ainda." + botão "Cadastrar"
- Erro: mensagem + botão "Tentar novamente"
- Remoção: confirmação (dialog "Remover {nome}? Esta ação não pode ser desfeita.") antes
  de executar

## 6. Componentes

```
app/painel/funcionarios/page.tsx

components/painel/
├── employees-table.tsx
└── register-employee-dialog.tsx

features/painel/hooks/
├── use-employees.ts             # GET /store/:slug/employees
├── use-register-employee.ts     # POST /stores/:slug/collaborators
└── use-remove-employee.ts       # DELETE /store/:slug/delete/:employeeId
```

## 7. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
React Hook Form + Zod, componentes de UI seguindo Base UI + tailwind-variants +
tailwind-merge (Button, Input, Dialog já existem em src/components/ui/).

Tarefa: implementar a tela de funcionários em src/app/painel/funcionarios/page.tsx,
seguindo rigorosamente o documento "Spec: Funcionários (Painel do Lojista)". Acessível
SÓ para role === 'Proprietário' — adicionar verificação client-side e redirecionar
Funcionário que tentar acessar (o middleware em /painel só garante Funcionário OU
Proprietário de forma ampla, não distingue os dois).

Requisitos:
- Tabela: nome, e-mail, botão "Remover" (com confirmação via dialog antes de chamar
  DELETE /store/:slug/delete/:employeeId)
- Botão "+ Cadastrar" abre Dialog (Base UI) com formulário: nome, e-mail, senha
- POST /stores/:slug/collaborators
  storeId vem de GET /me (campo store_id)
- Após cadastro com sucesso: fechar dialog, mostrar aviso "Compartilhe este e-mail e
  senha com o funcionário para o primeiro acesso.", atualizar a tabela
- Estados: loading (skeleton), vazio (com CTA de cadastrar), erro (com retry)

Toda chamada HTTP usa credentials: 'include'.

Não implementar: edição de dados de funcionário existente, alteração de papel
(Funcionário/Proprietário) — fora do escopo desta tela.
```