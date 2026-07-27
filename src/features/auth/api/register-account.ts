import { apiClient } from '@/lib/api-client'

export interface RegisterAccountInput {
  name: string
  email: string
  password: string
}

export async function registerAccount(input: RegisterAccountInput) {
  await apiClient<void>('/accounts', { method: 'POST', body: input })
}
