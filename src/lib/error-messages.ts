/**
 * Tradução das mensagens de erro da API para o usuário final.
 *
 * A API responde com mensagens em inglês (ex.: "Invalid credentials.").
 * Em vez de exibir esse texto cru ao usuário, este módulo converte cada
 * mensagem documentada em `docs/errors.md` para uma mensagem clara em pt-BR,
 * sem revelar detalhes internos da aplicação (ex.: "esse e-mail já existe",
 * "loja/produto/categoria X não encontrado", IDs, papéis internos, etc.).
 *
 * Estratégia:
 * - Lista ordenada de regras por substring (padrões mais específicos primeiro).
 * - Fallback pelo código HTTP da resposta.
 * - Fallback final genérico.
 */

type ErrorRule = {
  /** Recebe a mensagem normalizada (minúsculas). Retorna true se aplica. */
  test: (message: string) => boolean;
  /** Mensagem amigável exibida ao usuário. */
  message: string;
};

// Mensagens que já possuem indícios claros de português são preservadas.
const PORTUGUESE_HINTS =
  /(n[ãa]o|voc[eê]|sess[ãa]o|senha|tente|tentar|endere[çc]o|carrinho|pedido|dados|cadastr|permiss[ãa]o|lojista|produto|imagem|sucesso)/i;

const RULES: ErrorRule[] = [
  // ─── Login / Google ──────────────────────────────────────────────
  {
    test: (m) => m.includes("google") || m.includes("id_token"),
    message: "Não foi possível entrar com o Google. Tente novamente.",
  },
  {
    test: (m) =>
      m.includes("invalid credentials") ||
      m.includes("credentials are incorrect"),
    message: "E-mail ou senha incorretos. Verifique e tente novamente.",
  },

  // ─── Alteração de senha ──────────────────────────────────────────
  {
    test: (m) =>
      m.includes("current password") ||
      m.includes("current password is incorrect") ||
      m.includes("old password"),
    message: "A senha atual está incorreta.",
  },

  // ─── Sessão / autenticação ───────────────────────────────────────
  {
    test: (m) => m.includes("refresh token"),
    message: "Sua sessão expirou. Entre novamente para continuar.",
  },
  {
    test: (m) =>
      m.includes("invalid authentication credentials") ||
      m.includes("authentication required") ||
      m.includes("not authenticated") ||
      m.includes("session expired") ||
      m.includes("login again"),
    message: "Sua sessão expirou. Entre novamente para continuar.",
  },

  // ─── Permissão ───────────────────────────────────────────────────
  {
    test: (m) =>
      m.includes("does not have permission") ||
      m.includes("do not have permission") ||
      m.includes("cannot manage this store") ||
      m.includes("forbidden"),
    message: "Você não tem permissão para realizar esta ação.",
  },

  // ─── Validação de dados ──────────────────────────────────────────
  {
    test: (m) =>
      m.includes("invalid address data") ||
      m.includes("invalid address or store"),
    message: "Verifique os dados do endereço e tente novamente.",
  },
  {
    test: (m) =>
      m.includes("invalid product size") ||
      m.includes("selected size is invalid") ||
      m.includes("size is invalid"),
    message: "O tamanho selecionado não está disponível para este produto.",
  },
  {
    test: (m) => m.includes("invalid product status"),
    message: "O status informado não é válido para este produto.",
  },
  {
    test: (m) => m.includes("cart is empty"),
    message: "Seu carrinho está vazio.",
  },
  {
    test: (m) =>
      m.includes("invalid request data") ||
      m.includes("invalid request") ||
      m.includes("invalid data") ||
      m.includes("validation failed"),
    message: "Verifique os dados informados e tente novamente.",
  },

  // ─── Não encontrado ──────────────────────────────────────────────
  {
    test: (m) => m.includes("store not found"),
    message: "Não encontramos a loja solicitada.",
  },
  {
    test: (m) => m.includes("product or image not found"),
    message: "Não encontramos o produto ou a imagem solicitada.",
  },
  {
    test: (m) => m.includes("product not found"),
    message: "Não encontramos o produto solicitado.",
  },
  {
    test: (m) => m.includes("address not found"),
    message: "Não encontramos o endereço solicitado.",
  },
  {
    test: (m) => m.includes("cart item") || m.includes("cart item or product"),
    message: "Não encontramos o item do carrinho solicitado.",
  },
  {
    test: (m) => m.includes("cart not found"),
    message: "Não encontramos o carrinho solicitado.",
  },
  {
    test: (m) => m.includes("order not found"),
    message: "Não encontramos o pedido solicitado.",
  },
  {
    test: (m) => m.includes("category not found"),
    message: "Não encontramos a categoria solicitada.",
  },
  {
    test: (m) =>
      m.includes("store, category or subcategory not found") ||
      m.includes("product, category or subcategory not found") ||
      m.includes("store or employee not found") ||
      m.includes("store or current logo not found") ||
      m.includes("store or logo image not found"),
    message: "Não encontramos o que você procura.",
  },
  {
    test: (m) => m.includes("not found") || m.includes("could not be found"),
    message: "Não encontramos o que você procura. Verifique e tente novamente.",
  },

  // ─── Conflitos de estado ─────────────────────────────────────────
  {
    test: (m) =>
      m.includes("quantity exceeds") ||
      m.includes("exceeds available stock") ||
      m.includes("insufficient stock") ||
      m.includes("unavailable or quantity exceeds"),
    message: "A quantidade solicitada não está disponível no momento.",
  },
  {
    test: (m) =>
      m.includes("product is unavailable") || m.includes("product unavailable"),
    message: "Este produto não está disponível no momento.",
  },
  {
    test: (m) => m.includes("cannot delete store owner"),
    message: "Não é possível remover o responsável pela loja.",
  },
  {
    test: (m) => m.includes("store address cannot be updated"),
    message: "Não foi possível atualizar o endereço da loja.",
  },
  {
    test: (m) => m.includes("store already has a logo"),
    message: "Esta loja já possui um logo cadastrado.",
  },
  {
    test: (m) => m.includes("maximum number of images"),
    message: "O limite de imagens deste produto foi atingido.",
  },
  {
    test: (m) => m.includes("already the main image"),
    message: "Esta imagem já é a imagem principal do produto.",
  },
  {
    test: (m) =>
      m.includes("store is already active") ||
      m.includes("store is already inactive"),
    message: "Esta loja já está no status solicitado.",
  },
  {
    test: (m) => m.includes("product already has this status"),
    message: "Este produto já está no status solicitado.",
  },
  {
    test: (m) =>
      m.includes("unable to complete the requested operation") ||
      m.includes("unable to process the request") ||
      m.includes("cannot be processed") ||
      m.includes("could not be completed"),
    message: "Não foi possível concluir a operação. Tente novamente.",
  },
  {
    test: (m) =>
      m.includes("already exists") ||
      m.includes("already registered") ||
      m.includes("already in use") ||
      m.includes("already active") ||
      m.includes("already inactive"),
    message:
      "Não foi possível concluir a operação. Verifique os dados e tente novamente.",
  },

  // ─── Arquivos / upload ───────────────────────────────────────────
  {
    test: (m) =>
      m.includes("file") &&
      (m.includes("type") ||
        m.includes("size") ||
        m.includes("format") ||
        m.includes("invalid") ||
        m.includes("too large") ||
        m.includes("extension")),
    message:
      "O arquivo enviado não é válido. Use PNG, JPG ou WebP com até 5MB.",
  },
];

const STATUS_FALLBACKS: Record<number, string> = {
  400: "Verifique os dados informados e tente novamente.",
  401: "Sua sessão expirou. Entre novamente para continuar.",
  403: "Você não tem permissão para realizar esta ação.",
  404: "Não encontramos o que você procura.",
  409: "Não foi possível concluir a operação. Tente novamente.",
  422: "Verifique os dados informados e tente novamente.",
  429: "Muitas tentativas em sequência. Aguarde um instante e tente novamente.",
  500: "Não foi possível concluir a solicitação. Tente novamente em instantes.",
  502: "Não foi possível concluir a solicitação. Tente novamente em instantes.",
  503: "O serviço está temporariamente indisponível. Tente novamente em instantes.",
};

const GENERIC_FALLBACK =
  "Não foi possível concluir a solicitação. Tente novamente.";

/**
 * Traduz uma mensagem de erro da API para pt-BR amigável ao usuário final.
 *
 * @param message Mensagem bruta retornada pela API (ou fallback local).
 * @param status  Código HTTP da resposta (usado como fallback).
 */
export function translateApiError(message: string, status?: number): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return status
      ? (STATUS_FALLBACKS[status] ?? GENERIC_FALLBACK)
      : GENERIC_FALLBACK;
  }

  // Mensagens que já estão em português são preservadas.
  const normalized = trimmed.toLowerCase();
  if (PORTUGUESE_HINTS.test(normalized)) return trimmed;

  for (const rule of RULES) {
    if (rule.test(normalized)) return rule.message;
  }

  if (status && STATUS_FALLBACKS[status]) return STATUS_FALLBACKS[status];

  return GENERIC_FALLBACK;
}
