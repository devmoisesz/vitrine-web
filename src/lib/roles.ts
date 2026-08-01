export function normalizeRole(role: string | undefined | null): string {
  if (!role) return "";
  return role
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isOwnerRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === "proprietario";
}

export function isEmployeeRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === "funcionario";
}

export function isAdminRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === "admin";
}

export function isCollaboratorRole(role: string | undefined | null): boolean {
  const normalized = normalizeRole(role);
  return normalized === "proprietario" || normalized === "funcionario";
}

/**
 * Retorna o caminho de destino pós-login com base no papel do usuário.
 * - "admin" → /admin
 * - "proprietario" | "funcionario" → /painel
 * - qualquer outro (cliente) → / (catálogo)
 */
export function roleToDashboardPath(role: string | undefined | null): string {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "/admin";
  if (normalized === "proprietario" || normalized === "funcionario") {
    return "/painel";
  }
  return "/";
}

/**
 * Decodifica o campo `role` de um JWT (access token) sem validar a assinatura.
 * Usado apenas para decisões de UI/roteamento — a autorização real é feita no
 * backend e no middleware com `jwtVerify`.
 */
export function decodeJwtRole(token: string | undefined | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // JWT (base64url) omite o padding "="; atob (Node) pode exigir
    while (base64.length % 4 !== 0) base64 += "=";
    // Decodifica base64 para bytes e depois UTF-8 — necessário
    // para não corromper caracteres acentuados (ex.: "Funcionário").
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as {
      role?: unknown;
    };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}
