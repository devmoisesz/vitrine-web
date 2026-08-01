import { translateApiError } from "./error-messages";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://vitrine-web-api.onrender.com";

let globalAccessToken: string | null = null;
const accessTokenListeners = new Set<() => void>();

export function setAccessToken(token: string | null) {
  globalAccessToken = token;
  accessTokenListeners.forEach((listener) => listener());
}

export function getAccessToken() {
  return globalAccessToken;
}

export function subscribeToAccessToken(listener: () => void) {
  accessTokenListeners.add(listener);
  return () => accessTokenListeners.delete(listener);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  authenticated?: boolean;
  accessToken?: string | null;
}

// ─── Refresh token logic ────────────────────────────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let failedQueue: Array<{
  resolve: (value: boolean) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(true);
    }
  });
  failedQueue = [];
}

/**
 * Tenta renovar o access_token chamando PATCH /refresh.
 * O refresh_token é lido pelo backend automaticamente do cookie httpOnly.
 */
export async function refreshSession(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    // Já existe uma requisição de refresh em andamento — aguarda
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/session/refresh", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new ApiError(
          "Sessão expirada. Faça login novamente.",
          response.status,
        );
      }

      const data = (await response.json()) as {
        access_token: string;
      };
      setAccessToken(data.access_token);
      processQueue(null, data.access_token);
      return true;
    } catch (error) {
      setAccessToken(null);
      processQueue(error, null);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── apiClient with auto-refresh on 401 ─────────────────────────────────────

export async function apiClient<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    body,
    authenticated = false,
    accessToken: explicitToken,
    headers,
    ...requestOptions
  } = options;

  const token = explicitToken ?? (authenticated ? globalAccessToken : null);

  const isJsonBody =
    body !== undefined &&
    typeof body !== "string" &&
    !(body instanceof FormData);

  const bodyPayload = isJsonBody
    ? JSON.stringify(body)
    : (body as BodyInit | undefined);

  let response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    // A API mantém o refresh token em um cookie httpOnly. Como ela pode estar
    // em outro domínio, é necessário incluí-lo também no login para que o
    // navegador aceite o Set-Cookie da resposta.
    credentials: requestOptions.credentials ?? "include",
    body: bodyPayload,
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  // ── Auto-refresh on 401 ─────────────────────────────────────────────
  if (
    response.status === 401 &&
    (authenticated || explicitToken || globalAccessToken)
  ) {
    // Se já estávamos tentando refresh, aguarda na fila
    if (isRefreshing) {
      await new Promise<boolean>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
      // Refaz a requisição com o novo token
      const newToken = globalAccessToken;
      response = await fetch(`${API_URL}${path}`, {
        ...requestOptions,
        credentials: requestOptions.credentials ?? "include",
        body: bodyPayload,
        headers: {
          ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
          ...headers,
        },
      });
    } else {
      // Inicia o refresh
      const refreshed = await refreshSession();
      if (refreshed) {
        // Refaz a requisição com o novo token
        response = await fetch(`${API_URL}${path}`, {
          ...requestOptions,
          credentials: requestOptions.credentials ?? "include",
          body: bodyPayload,
          headers: {
            ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
            ...(globalAccessToken
              ? { Authorization: `Bearer ${globalAccessToken}` }
              : {}),
            ...headers,
          },
        });
      }
    }
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;

    const rawMessage = Array.isArray(payload?.message)
      ? payload.message.join(" ")
      : (payload?.message ??
        "Não foi possível concluir a solicitação. Tente novamente.");

    // Traduz a mensagem bruta da API para pt-BR amigável ao usuário final,
    // sem expor detalhes internos da aplicação.
    throw new ApiError(
      translateApiError(rawMessage, response.status),
      response.status,
    );
  }

  const responseText = await response.text();
  if (!responseText) return undefined as T;

  try {
    return JSON.parse(responseText) as T;
  } catch {
    // Alguns endpoints 2xx respondem com texto cru (ex: POST
    // /stores/:slug/products retorna apenas o UUID do produto, sem JSON).
    // Nesses casos devolvemos o texto em vez de lançar SyntaxError.
    return responseText as unknown as T;
  }
}
