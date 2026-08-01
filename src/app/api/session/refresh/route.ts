import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwtRole, normalizeRole } from "@/lib/roles";

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
  const response = NextResponse.json({ access_token: data.access_token });
  if (data.refresh_token)
    response.cookies.set("refreshToken", data.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  // Mantém o cookie de role atualizado a cada refresh.
  // Guardamos o role normalizado (minúsculas, sem acento) para evitar
  // problemas de encoding de caracteres acentuados em cookies.
  const role = decodeJwtRole(data.access_token);
  if (role) {
    response.cookies.set("userRole", normalizeRole(role), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return response;
}
