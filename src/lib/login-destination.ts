/** Explicit internal return paths preserve an interrupted action; normal login opens the catalogue. */
export function loginDestination(search: string): string {
  const params = new URLSearchParams(search);
  const candidate = params.get("redirect") ?? params.get("next");
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\") || [...candidate].some(char => char.charCodeAt(0) < 32)) return "/catalogo";
  const url = new URL(candidate, "https://vitrine.invalid");
  if (url.origin !== "https://vitrine.invalid" || ["/", "/login", "/cadastro", "/session/restore"].includes(url.pathname.replace(/\/$/, "") || "/")) return "/catalogo";
  return url.pathname + url.search + url.hash;
}
