import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveUserRole } from "@/lib/session-role";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export async function PATCH(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken)
    return NextResponse.json(
      { message: "Sessão expirada. Faça login novamente." },
      { status: 401 },
    );
  const upstream = await fetch(`${apiUrl}/refresh`, {
    method: "PATCH",
    headers: { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` },
  });
  const body = await upstream.text();
  if (!upstream.ok)
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/json",
      },
    });
  const data = JSON.parse(body) as {
    access_token: string;
    refresh_token?: string;
  };

  // Resolve o papel efetivo (GET /me) com fallback para o JWT, mantendo o
  // cookie `userRole` atualizado a cada refresh.
  const userRole = await resolveUserRole(data.access_token);

  const response = NextResponse.json({
    access_token: data.access_token,
    user_role: userRole,
  });
  if (data.refresh_token)
    response.cookies.set("refreshToken", data.refresh_token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });
  if (userRole) {
    response.cookies.set("userRole", userRole, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });
  }
  return response;
}
