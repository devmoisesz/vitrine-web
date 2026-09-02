import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "https://vitrine-web-api.onrender.com";

function normalizeRole(role: string | undefined) {
  return role
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPainelRoute = pathname.startsWith("/painel");

  if (!isAdminRoute && !isPainelRoute) return NextResponse.next();

  const refreshToken = request.cookies.get("refreshToken")?.value;
  let accessToken = request.cookies.get("accessToken")?.value;

  if (!refreshToken) return NextResponse.redirect(new URL("/", request.url));

  try {
    // userRole é apenas cache da UI; a autorização vem do papel efetivo em /me.
    let refreshedSession: {
      access_token?: string;
      refresh_token?: string;
    } | null = null;
    let profileResponse = accessToken
      ? await fetch(`${apiUrl}/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        })
      : null;

    if (!profileResponse?.ok) {
      const refreshResponse = await fetch(`${apiUrl}/refresh`, {
        method: "PATCH",
        headers: { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` },
        cache: "no-store",
      });
      if (!refreshResponse.ok) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      refreshedSession = (await refreshResponse.json()) as {
        access_token?: string;
        refresh_token?: string;
      };
      accessToken = refreshedSession.access_token;
      if (!accessToken) return NextResponse.redirect(new URL("/", request.url));

      profileResponse = await fetch(`${apiUrl}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (!profileResponse.ok) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    const profile = (await profileResponse.json()) as { user_role?: string };
    const userRole = normalizeRole(profile.user_role);

    let response: NextResponse;
    if (isAdminRoute) {
      response =
        userRole === "admin"
          ? NextResponse.next()
          : NextResponse.redirect(new URL("/", request.url));
    } else if (userRole === "funcionario" || userRole === "proprietario") {
      response = NextResponse.next();
    } else if (userRole === "admin") {
      response = NextResponse.redirect(new URL("/admin", request.url));
    } else {
      response = NextResponse.redirect(new URL("/", request.url));
    }

    if (refreshedSession?.refresh_token) {
      response.cookies.set("refreshToken", refreshedSession.refresh_token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60,
      });
    }
    if (refreshedSession?.access_token) {
      response.cookies.set("accessToken", refreshedSession.access_token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 15 * 60,
      });
    }
    if (userRole) {
      response.cookies.set("userRole", userRole, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60,
      });
    } else {
      response.cookies.delete("userRole");
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/painel/:path*"],
};
