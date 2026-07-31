# Vitrine Web — Spec: Produtos do Painel do Lojista (Listagem + Cadastro/Edição)

## 1. Contexto

Três rotas dentro de `/painel`:
- `src/app/painel/produtos/page.tsx` — listagem (todos os status)
- `src/app/painel/produtos/novo/page.tsx` — cadastro
- `src/app/painel/produtos/[productId]/editar/page.tsx` — edição

Acessível por `Funcionário` e `Proprietário` (mesmas permissões para produtos — a
distinção Funcionário/Proprietário só importa em Funcionários/Logo/Endereço da loja).

## 2. Contrato de API

```
GET /store/:slug/manage/products?status=&page=   [endpoint novo — ver documento
                                                     "Painel do Lojista — Dashboard",
                                                     seção 4]
Resposta: Product[], incluindo ATIVO e INATIVO
```

```
POST /stores/:slug/products
Body: {
  name_product: string,
  tags: string[],
  description: string,
  price: number,
  sizes: string[],
  stock: number,
  name_category: string,
  name_subcategory: string
}
Resposta: 201, retorna o id do produto criado (string)

⚠️ Usa name_category/name_subcategory (nomes, não IDs) — diferente do padrão do resto
da API. Os dropdowns encadeados (ver seção 4) exibem os nomes vindos de GET /categories,
então isso funciona sem problema — só não confundir com categoryId/subcategoryId usados
em outras rotas.
```

```
PUT /stores/:slug/products/:productId
Body (schema real do backend — TODOS os campos opcionais, atualização parcial):
{
  newNameProduct?: string,       // min 1 char
  newTags?: string[],             // máx 10 tags, cada uma até 30 caracteres
  newDescription?: string,        // min 1 char
  newPrice?: number,               // positivo
  newSizes?: string[],             // valores restritos a ALLOWED_SIZES (ver seção 5)
  newStock?: number,               // positivo
  newCategory?: string,            // nome da categoria (não ID)
  newSubcategory?: string,         // nome da subcategoria (não ID)
}
Resposta: 204
```

⚠️ **Nomenclatura inconsistente entre criar e editar:** o `POST` usa
`name_category`/`name_subcategory` (snake_case, sem prefixo), o `PUT` usa
`newCategory`/`newSubcategory` (camelCase, prefixo "new"). São schemas Zod diferentes —
o formulário de edição precisa montar o body com os nomes de campo certos para cada
operação, não pode reaproveitar o mesmo objeto de estado sem mapear os nomes.

**Como é uma atualização parcial (todos os campos opcionais):** o formulário de edição
deve enviar **só os campos que o colaborador de fato alterou**, não o objeto inteiro a
cada vez — evita sobrescrever campos sem querer caso a lógica de "valor padrão" do
formulário tenha algum bug.

```
DELETE /stores/:slug/products/:productId/
Resposta: 204
```

```
PATCH /stores/:slug/products/:productId/status
Body: { status: "ATIVO" | "INATIVO" }
Resposta: 204
```

## 3. Regra de Negócio Importante: Produto Nasce Sem Imagem, Sem Publicar

O `POST /stores/:slug/products` cria o produto, mas **o backend só ativa o produto
automaticamente quando a primeira imagem é enviada** (confirmado no código do
`UploadProductImagesService`: `activateProduct(productId, 'ATIVO')` roda dentro do
upload de imagem, não na criação do produto).

**Consequência de fluxo:** depois de criar o produto (`POST`), **redirecionar
imediatamente para a tela de gestão de imagens** daquele produto (spec já pronta:
"Spec: Gestão de Imagens do Produto") — o produto criado sozinho não aparece pra
ninguém até ter pelo menos uma imagem. Não faz sentido levar o colaborador de volta pra
listagem sem esse passo.

## 4. Tela: Listagem de Produtos (`/painel/produtos`)

### Layout
Tabela (contexto de gestão, não grid de vitrine):
```
┌──────────────────────────────────────────────────┐
│  Produtos                    [+ Cadastrar produto] │
│  Filtrar: [Todos ▾] [Todos os status ▾]            │
├──────────────────────────────────────────────────┤
│ Imagem │ Nome        │ Preço   │ Estoque │ Status  │ Ações        │
│ [thumb]│ Pants Black │ R$69,79 │ 39      │ Ativo   │ Editar ⋮     │
│ [thumb]│ Camisa Xis  │ R$49,90 │ 0       │ Inativo │ Editar ⋮     │
└──────────────────────────────────────────────────┘
```
- Coluna Status com badge (Ativo/Inativo — texto/peso, não cor, mantendo o padrão
  monocromático)
- Menu de ações (⋮) por linha: **Editar**, **Ativar/Desativar** (chama o PATCH de
  status), **Remover** (com confirmação — ação destrutiva)
- Filtro de status: Todos / Ativos / Inativos (`?status=` na query)
- Paginação: reaproveitar o componente `Pagination` já existente (modo degradado até
  `X-Total-Count` existir nessa rota também)

### Estados
- Loading: skeleton de linhas de tabela
- Vazio: "Nenhum produto cadastrado ainda." + botão "Cadastrar produto"
- Erro: mensagem + botão "Tentar novamente"

## 5. Tela: Cadastrar/Editar Produto

Mesmo formulário para os dois casos, só troca o endpoint (`POST` vs `PUT`) e os valores
iniciais (vazios vs. preenchidos com o produto existente).

### Campos
- **Nome** (`name_product` no create / `newNameProduct` no edit) — obrigatório
- **Descrição** (`description` / `newDescription`) — obrigatório
- **Preço** (`price` / `newPrice`) — obrigatório, numérico, positivo
- **Estoque** (`stock` / `newStock`) — obrigatório, numérico, positivo (lembrar: é o
  estoque total do produto, não por tamanho — mesma regra já documentada na tela de
  Detalhe do Produto)
- **Tamanhos** (`sizes` / `newSizes`) — opcional, **lista fixa pré-definida**, não texto
  livre. Renderizar como checkboxes/chips selecionáveis a partir de:
  ```
  PP, P, M, G, GG, XGG, EG, EGG,
  33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46,
  U, ÚNICO
  ```
  (constante `ALLOWED_SIZES` do backend — confirmar se o `POST` de criar produto valida
  contra a mesma lista; o schema de edição certamente valida)
- **Tags** (`tags` / `newTags`) — opcional, chips livres, com dois limites a validar no
  cliente antes de enviar: **máximo 10 tags**, cada uma com **até 30 caracteres**
- **Categoria** (`name_category` / `newCategory`) e **Subcategoria**
  (`name_subcategory` / `newSubcategory`) — **dropdowns encadeados**: a subcategoria só
  habilita e popula depois de escolher a categoria (regra de negócio explícita do
  `requirements.md`: "menus de seleção encadeados na interface, sem poder criar
  categorias livres"). Fonte de dados: `GET /categories` (já usado na Home, reaproveitar
  o hook `useCategories`)

**Nomenclatura por operação:** o componente de formulário deve montar o body com os
nomes de campo corretos dependendo se está criando ou editando (ver aviso na seção 2) —
não reaproveitar o mesmo objeto sem mapear.

### Submissão
- Criar: `POST /stores/:slug/products` → sucesso → **redirecionar para a gestão de
  imagens do produto recém-criado** (ver seção 3, regra de negócio)
- Editar: `PUT /stores/:slug/products/:productId` → sucesso → confirmação inline,
  permanece na tela ou volta para a listagem (não há o mesmo requisito de imagem aqui,
  já que produto existente já deve ter pelo menos uma)

### Estados
- Loading (modo edição, buscando dados do produto existente): skeleton do formulário
- Erro de validação: mensagens por campo (React Hook Form + Zod, espelhando as
  obrigatoriedades do schema do backend)
- Erro de submissão: mensagem genérica no topo do formulário

## 6. Componentes

```
app/painel/produtos/
├── page.tsx                        # listagem
├── novo/page.tsx                    # cadastro
└── [productId]/editar/page.tsx      # edição

components/painel/
├── products-table.tsx
├── product-status-badge.tsx
├── product-form.tsx                 # reaproveitado por novo/ e editar/
├── chained-category-select.tsx      # categoria + subcategoria encadeados
├── size-checklist.tsx                # seleção múltipla a partir de ALLOWED_SIZES
└── tags-input.tsx                    # chips livres, com limite de 10 tags / 30 caracteres

features/painel/hooks/
├── use-manage-products.ts           # GET /store/:slug/manage/products
├── use-create-product.ts            # POST /stores/:slug/products
├── use-update-product.ts            # PUT /stores/:slug/products/:productId
├── use-delete-product.ts            # DELETE /stores/:slug/products/:productId
└── use-toggle-product-status.ts     # PATCH .../status
```

## 7. Prompt Pronto para o Agente de IA

```
Contexto: projeto Next.js 14 (App Router) + TypeScript strict + Tailwind v4 do
marketplace Vitrine Web. Tokens de design em src/app/globals.css. Stack: TanStack Query,
React Hook Form + Zod, componentes de UI seguindo Base UI + tailwind-variants +
tailwind-merge (Button, Input, Badge já existem em src/components/ui/). O componente
Pagination já existe em src/components/catalog/pagination.tsx. useCategories já existe
em src/features/catalog/hooks/use-categories.ts — reaproveitar para os dropdowns
encadeados de categoria/subcategoria. A tela de gestão de imagens do produto já está
especificada em documento separado ("Spec: Gestão de Imagens do Produto") e deve já
existir implementada — reaproveitar sua rota como destino de redirecionamento.

Tarefa: implementar as três telas de produtos do painel do lojista, seguindo
rigorosamente o documento "Spec: Produtos do Painel do Lojista":
1. src/app/painel/produtos/page.tsx — listagem
2. src/app/painel/produtos/novo/page.tsx — cadastro
3. src/app/painel/produtos/[productId]/editar/page.tsx — edição

Listagem (GET /store/:slug/manage/products?status=&page=):
- Tabela: imagem, nome, preço, estoque, status (badge), menu de ações (Editar,
  Ativar/Desativar via PATCH .../status, Remover via DELETE com confirmação)
- Filtro de status (Todos/Ativos/Inativos) refletido em ?status= na URL
- Reaproveitar o componente Pagination existente
- Estados: loading (skeleton), vazio (com CTA de cadastrar), erro (com retry)

Cadastro/Edição (POST /stores/:slug/products para criar, PUT /stores/:slug/products/:productId
para editar — ATENÇÃO: nomes de campo DIFERENTES entre as duas operações, ver seção 2 e 5
do documento para o mapeamento exato):
- Campos: nome, descrição, preço (positivo), estoque (positivo; lembrar: estoque é do
  produto todo, não por tamanho), tamanhos (seleção múltipla a partir da lista FIXA
  ALLOWED_SIZES — PP, P, M, G, GG, XGG, EG, EGG, 33-46, U, ÚNICO — não é texto livre),
  tags (chips livres, máximo 10 tags, cada uma até 30 caracteres), categoria e
  subcategoria em dropdowns ENCADEADOS (subcategoria só habilita após escolher
  categoria), usando nomes (não IDs) no body
- No PUT de edição, TODOS os campos são opcionais (atualização parcial) — enviar
  apenas os campos que o colaborador de fato alterou, não o objeto inteiro
- CRÍTICO: após criar um produto com sucesso, redirecionar IMEDIATAMENTE para a tela de
  gestão de imagens daquele produto — o backend só ativa o produto quando a primeira
  imagem é enviada, então o fluxo de cadastro está incompleto sem esse passo
- Edição não tem esse redirecionamento obrigatório (produto existente já deve ter imagem)
- Validação client-side espelhando as obrigatoriedades do backend

Toda chamada HTTP usa credentials: 'include'.

Não implementar: reordenar produtos, exportar lista, duplicar produto — fora do
escopo por ora.
```