import { apiClient, setAccessToken } from '@/lib/api-client'

interface AuthenticationResponse { access_token: string; refresh_token: string }
export interface LoginCredentials { email: string; password: string }

async function saveSession(request: Promise<AuthenticationResponse>) {
  const session = await request
  setAccessToken(session.access_token)
}

export async function authenticate(credentials: LoginCredentials) {
  await saveSession(apiClient<AuthenticationResponse>('/authenticate', { method: 'POST', body: credentials }))
}

export async function authenticateWithGoogle(idToken: string) {
  await saveSession(apiClient<AuthenticationResponse>('/authenticate/google', { method: 'POST', body: { id_token: idToken } }))
}
