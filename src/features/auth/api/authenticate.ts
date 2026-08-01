import { ApiError, setAccessToken } from "@/lib/api-client";
import { translateApiError } from "@/lib/error-messages";

export interface AuthenticationResponse {
  access_token: string;
  user_role?: string | null;
}
export interface LoginCredentials {
  email: string;
  password: string;
}

async function sessionRequest(
  path: string,
  body?: unknown,
): Promise<AuthenticationResponse> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
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
  return response.json() as Promise<AuthenticationResponse>;
}

async function saveSession(
  request: Promise<AuthenticationResponse>,
): Promise<AuthenticationResponse> {
  const session = await request;
  setAccessToken(session.access_token);
  return session;
}

export async function authenticate(credentials: LoginCredentials) {
  return saveSession(sessionRequest("/api/session/login", credentials));
}

export async function authenticateWithGoogle(idToken: string) {
  return saveSession(
    sessionRequest("/api/session/google", { id_token: idToken }),
  );
}

export async function logout() {
  await fetch("/api/session/logout", {
    method: "POST",
    credentials: "include",
  });
  setAccessToken(null);
}
