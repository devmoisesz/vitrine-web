import { decodeJwtRole, normalizeRole } from "@/lib/roles";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

/**
 * Mapeia o papel efetivo retornado pelo GET /me do backend para o valor
 * normalizado usado no cookie `userRole` e no middleware.
 *
 * GET /me retorna: "Cliente" | "Admin" | "Proprietário" | "Funcionário".
 */
const PROFILE_ROLE_MAP: Record<string, string> = {
  Cliente: "cliente",
  Usuário: "cliente",
  Admin: "admin",
  Administrador: "admin",
  Proprietário: "proprietario",
  Funcionário: "funcionario",
};

export function normalizeProfileRole(role: string): string {
  return PROFILE_ROLE_MAP[role] ?? normalizeRole(role);
}

/**
 * Busca o papel efetivo do usuário chamando GET /me com o access token.
 * Retorna o papel normalizado, ou `null` se a chamada falhar.
 */
export async function fetchEffectiveRole(
  accessToken: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${apiUrl}/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user_role?: string };
    return data.user_role ? normalizeProfileRole(data.user_role) : null;
  } catch {
    return null;
  }
}

/**
 * Fallback: papel do claim `role` do access token (JWT).
 * O claim contém o enum Prisma — "USER" ou "ADMIN" — normalizado.
 */
export function roleFromJwt(accessToken: string): string | null {
  const role = decodeJwtRole(accessToken);
  return role ? normalizeRole(role) : null;
}

/**
 * Resolve o papel do usuário para gravar no cookie `userRole`.
 * 1ª opção: GET /me (papel efetivo — distingue Cliente/Admin/Proprietário/Funcionário).
 * Fallback: claim `role` do JWT.
 */
export async function resolveUserRole(
  accessToken: string,
): Promise<string | null> {
  const fromProfile = await fetchEffectiveRole(accessToken);
  if (fromProfile) return fromProfile;
  return roleFromJwt(accessToken);
}
