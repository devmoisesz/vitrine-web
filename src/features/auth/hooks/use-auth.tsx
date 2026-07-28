"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getAccessToken,
  subscribeToAccessToken,
  refreshSession,
} from "@/lib/api-client";

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
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const accessToken = useSyncExternalStore(
    subscribeToAccessToken,
    getAccessToken,
    () => null,
  );

  // Tenta restaurar a sessão via refresh token (cookie httpOnly) ao carregar o app
  useEffect(() => {
    let cancelled = false;

    async function tryRestoreSession() {
      try {
        const success = await refreshSession();
        if (cancelled) return;
        if (success) {
          console.log("[Auth] Sessão restaurada via refresh token");
        }
      } catch {
        // Sessão não pôde ser restaurada — sem refresh token no cookie
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false);
        }
      }
    }

    tryRestoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: null,
        accessToken,
        isAuthenticated: Boolean(accessToken),
        isLoading: isInitialLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
