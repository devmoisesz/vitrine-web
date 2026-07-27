'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { getAccessToken, subscribeToAccessToken } from '@/lib/api-client';

/**
 * Referência mínima — o projeto já deve ter uma versão real disso vinda da
 * implementação da tela de login (spec "Tela de Login", seção 3). Se sim,
 * ignore este arquivo e ajuste os imports do Header/ProductCard para apontar
 * para o hook real. O contrato esperado é este:
 */
export interface AuthContextValue {
  user: { id: string; name: string; email: string } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const accessToken = useSyncExternalStore(subscribeToAccessToken, getAccessToken, () => null);

  return (
    <AuthContext.Provider value={{ user: null, accessToken, isAuthenticated: Boolean(accessToken), isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
