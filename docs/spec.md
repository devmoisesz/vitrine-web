# Vitrine Web — Spec: Menu do Usuário (Header) + Página de Endereços

## 1. Contexto

Duas mudanças relacionadas:
1. Reorganizar o menu dropdown do ícone 👤 no Header, adicionando "Meu Perfil" e
   "Meus Endereços"
2. Extrair a gestão de endereços — hoje dentro da tela de Perfil — para uma página
   própria (`/enderecos`), evitando duplicar essa lógica em dois lugares

## 2. Menu do Usuário (dropdown do ícone 👤)

### Ordem final dos itens
```
┌─────────────────────┐
│ Meu Perfil            │ → /perfil
│ Meus Pedidos           │ → /pedidos
│ Meus Carrinhos         │ → /carrinhos
│ Meus Endereços         │ → /enderecos
├─────────────────────┤
│ Sair                   │ → POST /logout
└─────────────────────┘
```
- "Meu Perfil" entra **no topo**, acima de "Meus Pedidos"
- "Meus Endereços" entra **logo abaixo de "Meus Carrinhos"**, antes do divisor e do
  "Sair"
- Nenhuma mudança de comportamento nos itens que já existem (Meus Pedidos, Meus
  Carrinhos, Sair continuam levando para onde já levam)

## 3. Extrair Endereços do Perfil para `/enderecos`

### O que muda na tela de Perfil (`/perfil`)
- **Remover a seção "Endereços"** inteira (lista de cards, botão de adicionar, Dialog
  de criar/editar) — passa a viver só em `/enderecos`
- Perfil fica com duas seções: **Dados Pessoais** e **Segurança** (troca de senha)
- Os componentes já existentes (`address-list.tsx`, `address-form-dialog.tsx`,
  `address-card.tsx`, hooks `use-addresses.ts`/`use-save-address.ts`) **não são
  recriados** — só são movidos de `components/profile/` para `components/address/` (ou
  mantidos onde estão, só deixando de ser importados pelo Perfil) e passam a ser usados
  pela nova página

### Nova página: `/enderecos`

Contrato de API — **já documentado na spec original do Perfil, sem mudança nenhuma**:
```
GET /me/addresses?page=
POST /address/register
PUT /me/addressess/:addressId
```

Layout: exatamente o que já estava dentro da seção "Endereços" do Perfil — lista de
cards (label + endereço formatado), botão "+ Adicionar endereço" abrindo Dialog com
CEP autopreenchido via ViaCEP (campos sempre editáveis depois do autopreenchimento),
mesmo comportamento já especificado antes. **Sem exclusão de endereço** — mesma
limitação já registrada (API não tem endpoint de delete).

### Estados
Mesmos já especificados: loading (skeleton dos cards), vazio (texto + botão de
adicionar), erro (mensagem + retry).

## 4. Componentes

```
components/address/                 # renomeado de components/profile/ (só o que é
                                      # específico de endereço)
├── address-list.tsx
├── address-form-dialog.tsx
└── address-card.tsx

app/(account)/
├── perfil/page.tsx                  # atualizado: remove a seção de endereços
└── enderecos/page.tsx               # nova rota

features/address/                    # renomeado de features/profile/ (só o que é
                                      # específico de endereço)
├── hooks/
│   ├── use-addresses.ts
│   ├── use-save-address.ts
│   └── use-cep-lookup.ts
└── api/
    └── fetch-cep.ts
```

## 5. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. As telas de Perfil (src/app/(account)/perfil/page.tsx) e o
menu dropdown do ícone de usuário no Header já existem e estão implementados.

Tarefa: seguindo rigorosamente o documento "Spec: Menu do Usuário (Header) + Página de
Endereços", fazer duas mudanças:

1. No menu dropdown do ícone 👤 do Header:
   - Adicionar "Meu Perfil" no topo da lista, acima de "Meus Pedidos", apontando para
     /perfil
   - Adicionar "Meus Endereços" logo abaixo de "Meus Carrinhos", antes do divisor e do
     "Sair", apontando para /enderecos (rota nova, criada no passo 2)
   - Não alterar nenhum outro item existente (Meus Pedidos, Meus Carrinhos, Sair)

2. Extrair a gestão de endereços de dentro do Perfil para uma página própria:
   - Criar src/app/(account)/enderecos/page.tsx reaproveitando EXATAMENTE os
     componentes e hooks que já implementam a seção "Endereços" dentro do Perfil hoje
     (lista de cards, Dialog de criar/editar com autopreenchimento ViaCEP, mesmos
     endpoints GET /me/addresses, POST /address/register, PUT /me/addressess/:addressId)
     — NÃO recriar essa lógica do zero, só mover/reaproveitar
   - Remover a seção "Endereços" de dentro da tela de Perfil — o Perfil passa a ter só
     Dados Pessoais e Segurança
   - Manter os mesmos estados já implementados (loading, vazio, erro) na nova página

Toda chamada HTTP usa credentials: 'include'.

Não implementar: exclusão de endereço (API não suporta), atalho/link de volta de
/enderecos para /perfil — a navegação entre as duas passa a ser só pelo menu do Header.
```