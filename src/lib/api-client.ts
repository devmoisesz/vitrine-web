const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://vitrine-web-api.onrender.com'

let globalAccessToken: string | null = null
const accessTokenListeners = new Set<() => void>()

export function setAccessToken(token: string | null) {
  globalAccessToken = token
  accessTokenListeners.forEach((listener) => listener())
}

export function getAccessToken() {
  return globalAccessToken
}

export function subscribeToAccessToken(listener: () => void) {
  accessTokenListeners.add(listener)
  return () => accessTokenListeners.delete(listener)
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  authenticated?: boolean
  accessToken?: string | null
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
  } = options

  const token = explicitToken ?? (authenticated ? globalAccessToken : null)

  const isJsonBody =
    body !== undefined &&
    typeof body !== 'string' &&
    !(body instanceof FormData)

  const bodyPayload = isJsonBody
    ? JSON.stringify(body)
    : (body as BodyInit | undefined)

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    body: bodyPayload,
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string | string[]
    } | null

    const message = Array.isArray(payload?.message)
      ? payload.message.join(' ')
      : payload?.message ??
        'Não foi possível concluir a solicitação. Tente novamente.'

    throw new ApiError(message, response.status)
  }

  const responseText = await response.text()
  return (responseText ? JSON.parse(responseText) : undefined) as T
}
