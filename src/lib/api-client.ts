import { translateApiError } from "./error-messages";
import { withSessionLock } from "./session-lock";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://vitrine-web-api.onrender.com";

let globalAccessToken: string | null = null;
let globalUserRole: string | null = null;
const accessTokenListeners = new Set<() => void>();

export function setAccessToken(token: string | null, role?: string | null) {
  globalAccessToken = token;
  if (token) refreshFailure = null;
  if (!token) rateLimits.clear();
  globalUserRole = token ? (role === undefined ? globalUserRole : role) : null;
  accessTokenListeners.forEach((listener) => listener());
}

export function getAccessToken() {
  return globalAccessToken;
}

export function getUserRole() {
  return globalUserRole;
}

export function subscribeToAccessToken(listener: () => void) {
  accessTokenListeners.add(listener);
  return () => {
    accessTokenListeners.delete(listener);
  };
}

// ─── Session expired listeners ─────────────────────────────────────────────

const sessionExpiredListeners = new Set<() => void>();

export function subscribeToSessionExpired(listener: () => void) {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

function emitSessionExpired() {
  sessionExpiredListeners.forEach((listener) => listener());
}

/**
 * Decodifica o `exp` (epoch seconds) do access token JWT sem validar a
 * assinatura. Retorna `null` se o token for inválido ou não tiver `exp`.
 */
export function getAccessTokenExpiry(token: string | null): number | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) base64 += "=";
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as {
      exp?: unknown;
    };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryAt?: number,
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

let refreshPromise: Promise<boolean> | null = null;
let refreshFailure: ApiError | null = null;
const rateLimits = new Map<string, ApiError>();

export function retryAtFromResponse(response: Response): number | undefined {
  if (response.status !== 429) return undefined;
  const value = response.headers.get("Retry-After");
  const milliseconds = value && /^\d+(\.\d+)?$/.test(value.trim())
    ? Number(value) * 1000 : value ? Date.parse(value) - Date.now() : NaN;
  return Date.now() + (Number.isFinite(milliseconds) ? Math.max(1000, milliseconds) : 60_000);
}

/** Only a confirmed 401 expires the session. Temporary failures preserve it. */
export async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  if (refreshFailure?.retryAt && refreshFailure.retryAt > Date.now()) throw refreshFailure;
  const hadActiveSession = Boolean(globalAccessToken);
  refreshPromise = withSessionLock(async () => {
    try {
      const response = await fetch("/api/session/refresh", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        // The server may need both token rotation and a profile lookup.
        signal: AbortSignal.timeout(30_000),
      });
      if (response.status === 401) {
        refreshFailure = null;
        setAccessToken(null);
        if (hadActiveSession) emitSessionExpired();
        return false;
      }
      if (!response.ok) throw new ApiError("Não foi possível verificar sua sessão. Tente novamente em instantes.", response.status, retryAtFromResponse(response));
      const data = await response.json() as { access_token: string; user_role?: string | null };
      refreshFailure = null;
      setAccessToken(data.access_token, data.user_role);
      return true;
    } catch (error) {
      const failure = error instanceof ApiError ? error : new ApiError("Não foi possível conectar ao servidor.", 503);
      refreshFailure = new ApiError(failure.message, failure.status, failure.retryAt ?? Date.now() + 5_000);
      throw refreshFailure;
    } finally { refreshPromise = null; }
  });
  return refreshPromise;
}

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

  const limitKey = JSON.stringify([requestOptions.method ?? "GET", path, token]);
  const limited = rateLimits.get(limitKey);
  if (limited?.retryAt && limited.retryAt > Date.now()) throw limited;
  rateLimits.delete(limitKey);

  let response = await fetch(API_URL + path, {
    ...requestOptions,
    signal: requestOptions.signal ?? AbortSignal.timeout(20_000),
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

  if (response.status === 401 && (authenticated || explicitToken || globalAccessToken)) {
    if (await refreshSession()) {
      response = await fetch(API_URL + path, {
        ...requestOptions,
        signal: requestOptions.signal ?? AbortSignal.timeout(20_000),
        credentials: requestOptions.credentials ?? "include",
        body: bodyPayload,
        headers: {
          ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
          ...(globalAccessToken ? { Authorization: "Bearer " + globalAccessToken } : {}),
          ...headers,
        },
      });
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
    const error = new ApiError(
      translateApiError(rawMessage, response.status),
      response.status,
      retryAtFromResponse(response),
    );
    if (response.status === 429) {
      if (rateLimits.size >= 100) rateLimits.clear();
      rateLimits.set(limitKey, error);
    }
    throw error;
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
