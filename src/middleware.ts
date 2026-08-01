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

    // Papel normalizado. Fonte primária: cookie `userRole` — gravado no
    // login/refresh a partir do GET /me, que distingue com precisão
    // cliente/admin/proprietario/funcionario. Fallback: claim `role` do JWT
    // (enum Prisma: USER/ADMIN — não distingue cliente de colaborador).
    const rawRole = userRoleCookie ?? (payload.role as string | undefined);
    const userRole = rawRole
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // /admin: exige papel "admin".
    if (isAdminRoute) {
      if (userRole === "admin") return NextResponse.next();
      return NextResponse.redirect(new URL("/", request.url));
    }

    // /painel: exige papel de colaborador (funcionario/proprietario).
    if (isPainelRoute) {
      if (userRole === "funcionario" || userRole === "proprietario") {
        return NextResponse.next();
      }
      // Admin tentando acessar o painel → encaminha para o /admin.
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      // Cliente ou papel desconhecido/ambíguo → catálogo (nunca o painel).
      // Um cliente jamais pode renderizar a área do lojista.
      return NextResponse.redirect(new URL("/", request.url));
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
