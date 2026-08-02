"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getAccessToken,
  subscribeToAccessToken,
  subscribeToSessionExpired,
  refreshSession,
  getAccessTokenExpiry,
} from "@/lib/api-client";

export interface AuthContextValue {
  user: { id: string; name: string; email: string } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Força a renovação do access token via rota de refresh (keep-alive). */
  refresh: () => Promise<boolean>;
  /** Indica que a sessão expirou (refresh falhou com sessão ativa). */
  sessionExpired: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  refresh: () => Promise.resolve(false),
  sessionExpired: false,
});

// Margem de segurança: renova o access token ~60s antes de expirar de fato,
// evitando que uma chamada autenticada seja disparada com token já inválido.
const REFRESH_MARGIN_MS = 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accessToken = useSyncExternalStore(
    subscribeToAccessToken,
    getAccessToken,
    () => null,
  );

  const refresh = useCallback(async () => {
    return refreshSession();
  }, []);

  // Agenda a próxima renovação do access token baseado no `exp` do JWT.
  // Enquanto o refresh_token (cookie httpOnly) for válido, o loop mantém o
  // usuário logado indefinidamente — mesmo em uso ativo, sem precisar esperar
  // um 401 reativo.
  useEffect(() => {
    if (!accessToken) return;

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const expiry = getAccessTokenExpiry(accessToken);
    if (!expiry) return;

    const now = Date.now();
    const delay = Math.max(0, expiry * 1000 - now - REFRESH_MARGIN_MS);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        await refresh();
      } catch {
        // Falha no refresh proativo — o fluxo de 401/evento de sessão expirada
        // cuidará do estado. O setAccessToken(null) já foi feito em refreshSession.
      } finally {
        // Se ainda houver token (sessão renovada), agendar o próximo ciclo.
        if (getAccessToken()) {
          setSessionExpired(false);
        }
      }
    }, delay);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [accessToken, refresh]);

  // Reage à expiração real da sessão: refresh falhou com token ativo.
  useEffect(() => {
    const unsubscribe = subscribeToSessionExpired(() => {
      setSessionExpired(true);
      // Limpa o timer de refresh proativo que possa ter ficado agendado.
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    });
    return unsubscribe;
  }, []);

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
        refresh,
        sessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
