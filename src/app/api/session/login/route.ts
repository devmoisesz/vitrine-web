import { NextResponse } from "next/server";
import { resolveUserRole } from "@/lib/session-role";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

async function sessionResponse(data: {
  access_token: string;
  refresh_token: string;
}) {
  // Resolve o papel efetivo do usuário (GET /me distingue
  // Cliente/Admin/Proprietário/Funcionário) com fallback para o JWT.
  const userRole = await resolveUserRole(data.access_token);

  const response = NextResponse.json({
    access_token: data.access_token,
    user_role: userRole,
  });
  response.cookies.set("refreshToken", data.refresh_token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1h — alinhado ao refresh token do backend
  });
  // Grava o role em um cookie legível pelo middleware, normalizado
  // (minúsculas, sem acento) para evitar problemas de encoding.
  response.cookies.set("accessToken", data.access_token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 15 * 60,
  });
  if (userRole) {
    response.cookies.set("userRole", userRole, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });
  } else {
    // Evita manter um papel de uma sessão anterior caso a resolução do perfil
    // não esteja disponível para o usuário recém-autenticado.
    response.cookies.delete("userRole");
  }
  return response;
}

export async function POST(request: Request) {
  const upstream = await fetch(`${apiUrl}/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
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
  return sessionResponse(JSON.parse(body));
}
