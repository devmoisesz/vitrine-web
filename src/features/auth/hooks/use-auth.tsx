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
  getUserRole,
  subscribeToAccessToken,
  subscribeToSessionExpired,
  refreshSession,
  getAccessTokenExpiry,
  ApiError,
} from "@/lib/api-client";
import { SessionRetry } from "@/components/auth/session-retry";

export interface AuthContextValue {
  user: { id: string; name: string; email: string } | null;
  role: string | null;
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
  role: null,
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
  const [restoreError, setRestoreError] = useState<ApiError | null>(null);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accessToken = useSyncExternalStore(
    subscribeToAccessToken,
    getAccessToken,
    () => null,
  );
  const role = useSyncExternalStore(
    subscribeToAccessToken,
    getUserRole,
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
    let cancelled = false;

    const renew = async () => {
      try {
        await refresh();
      } catch (error) {
        const retryAt = error instanceof ApiError ? error.retryAt : undefined;
        if (!cancelled) refreshTimerRef.current = setTimeout(renew, Math.max(5000, (retryAt ?? 0) - Date.now()));
      } finally {
        // Se ainda houver token (sessão renovada), agendar o próximo ciclo.
        if (getAccessToken()) {
          setSessionExpired(false);
        }
      }
    };
    refreshTimerRef.current = setTimeout(renew, delay);

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [accessToken, refresh]);

  // Browsers podem pausar timers de abas em segundo plano. Ao voltar para a
  // aplicação, renova imediatamente se o access token estiver perto de expirar
  // (ou já tiver expirado), desde que o cookie httpOnly ainda seja válido.
  useEffect(() => {
    if (!accessToken) return;

    const refreshIfNeeded = () => {
      const expiry = getAccessTokenExpiry(getAccessToken());
      if (!expiry || expiry * 1000 - Date.now() <= REFRESH_MARGIN_MS) {
        void refresh().catch(() => { /* The scheduled retry preserves the session. */ });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshIfNeeded();
    };

    window.addEventListener("pageshow", refreshIfNeeded);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pageshow", refreshIfNeeded);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
        setRestoreError(null);
        const success = await refreshSession();
        if (cancelled) return;
        if (success) {
          console.log("[Auth] Sessão restaurada via refresh token");
        }
      } catch (error) {
        if (!cancelled) setRestoreError(error instanceof ApiError ? error : new ApiError("Servidor indisponível", 503));
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
  }, [restoreAttempt]);

  return (
    <AuthContext.Provider
      value={{
        user: null,
        role,
        accessToken,
        isAuthenticated: Boolean(accessToken),
        isLoading: isInitialLoading,
        refresh,
        sessionExpired,
      }}
    >
      {restoreError && !accessToken ? <SessionRetry retryAt={restoreError.retryAt} onRetry={() => {
        setIsInitialLoading(true);
        setRestoreAttempt((value) => value + 1);
      }} /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
