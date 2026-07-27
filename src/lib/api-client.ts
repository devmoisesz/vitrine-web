const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://vitrine-web-api.onrender.com'

let accessToken: string | null = null

export function setAccessToken(token: string | null) { accessToken = token }
export function getAccessToken() { return accessToken }

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> { body?: unknown; authenticated?: boolean }

export async function apiClient<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, authenticated = false, headers, ...requestOptions } = options
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(authenticated && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...headers },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string | string[] } | null
    const message = Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message ?? 'Não foi possível concluir a solicitação. Tente novamente.'
    throw new ApiError(message, response.status)
  }
  const responseText = await response.text()
  return (responseText ? JSON.parse(responseText) : undefined) as T
}
