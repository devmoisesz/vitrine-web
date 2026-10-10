import { isAdminRole, isCollaboratorRole, isOwnerRole, roleToDashboardPath } from "./roles";
import { storeDiscoveryHref } from "./store-discovery";

const publicPaths = /^\/(?:lojas|sobre|contato|catalogo|loja\/[a-zA-Z0-9-]+(?:\/produtos)?|produto\/[a-zA-Z0-9-]+)\/?$/;
const accountPaths = /^\/(?:perfil|enderecos|carrinho|pedidos(?:\/[a-zA-Z0-9-]+)?|carrinhos\/[a-zA-Z0-9-]+\/checkout)\/?$/;
const adminPaths = /^\/admin(?:\/(?:lojas(?:\/nova|\/[a-zA-Z0-9-]+\/editar)?|segmentos|categorias(?:\/nova|\/subcategorias\/nova)?))?\/?$/;
const storePaths = /^\/painel(?:\/(?:loja|funcionarios|pedidos(?:\/[a-zA-Z0-9-]+)?|produtos(?:\/novo|\/[a-zA-Z0-9-]+\/(?:editar|imagens))?))?\/?$/;

/** Only known internal UI routes; never API endpoints or authentication loops. */
export function safeReturnPath(candidate: string | null | undefined): string | null {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || /[\\\\\x00-\x1f\x7f]/.test(candidate)) return null;
  try {
    const url = new URL(candidate, "https://vitrine.invalid");
    const path = url.pathname;
    if (url.origin !== "https://vitrine.invalid" || !(publicPaths.test(path) || accountPaths.test(path) || adminPaths.test(path) || storePaths.test(path))) return null;
    if (path.replace(/\/$/, "") === "/catalogo") return storeDiscoveryHref(url.searchParams);
    return path + url.search + url.hash;
  } catch { return null; }
}

export function authHref(route: "/login" | "/cadastro", destination?: string | null) {
  const safe = safeReturnPath(destination);
  return safe ? `${route}?${new URLSearchParams({ redirect: safe })}` : route;
}

export function loginDestination(search: string, role?: string | null): string {
  const params = new URLSearchParams(search);
  const destination = safeReturnPath(params.get("redirect") ?? params.get("next"));
  const fallback = roleToDashboardPath(role);
  if (!destination) return fallback;
  const path = new URL(destination, "https://vitrine.invalid").pathname;
  if (adminPaths.test(path) && !isAdminRole(role)) return fallback;
  if (storePaths.test(path) && (!isCollaboratorRole(role) || (/^\/painel\/(loja|funcionarios)\/?$/.test(path) && !isOwnerRole(role)))) return fallback;
  return destination;
}
