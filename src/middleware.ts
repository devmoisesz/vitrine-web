import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { importSPKI, jwtVerify } from "jose";

const publicKey = process.env.JWT_PUBLIC_KEY;

function getPublicKey() {
  if (!publicKey) return null;

  // The deployed environment stores this PEM as base64. Supporting a regular PEM
  // too keeps local configuration straightforward.
  return publicKey.includes("BEGIN PUBLIC KEY")
    ? publicKey.replace(/\\n/g, "\n")
    : atob(publicKey);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPainelRoute = pathname.startsWith("/painel");

  if (!isAdminRoute && !isPainelRoute) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refreshToken")?.value;
  const userRoleCookie = request.cookies.get("userRole")?.value;
  const pem = getPublicKey();

  // Sem refresh token → não autenticado → vai para o login.
  if (!refreshToken || !pem) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url),
    );
  }

  try {
    const key = await importSPKI(pem, "RS256");
    const { payload } = await jwtVerify(refreshToken, key);

    // Fonte primária: cookie `userRole` (gravado no login/refresh a partir do
    // access token, que contém o claim `role`). O cookie já está normalizado
    // (minúsculas, sem acento). Fallback: claim do refresh token, também
    // normalizado na comparação.
    const rawRole = userRoleCookie ?? (payload.role as string | undefined);
    const userRole = rawRole
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Admin: exige role "admin" — se não for, bloqueia.
    if (isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Painel: aceita roles de colaborador. Se o role não for reconhecido
    // (undefined/desconhecido), deixamos passar — a autorização real (vínculo
    // com a loja) é feita pelo backend (StoreAccessGuard), que retorna 401/403
    // quando o usuário não é colaborador da loja. Assim, funcionários e
    // proprietários legítimos não são bloqueados por um problema de
    // grafia/encoding do role no cookie.
    const collaboratorRoles = ["funcionario", "proprietario"];
    if (
      isPainelRoute &&
      userRole !== undefined &&
      !collaboratorRoles.includes(userRole)
    ) {
      // Role explicitamente não-colaborador (ex.: cliente ou admin) → bloqueia.
      if (userRole === "cliente" || userRole === "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url),
    );
  }
}

export const config = {
  matcher: ["/admin/:path*", "/painel/:path*"],
};
