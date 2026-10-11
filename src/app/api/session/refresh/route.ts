import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveUserRole } from "@/lib/session-role";
import { setSessionCookies } from "@/lib/session-cookies";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export async function PATCH(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken)
    return NextResponse.json(
      { message: "Sessão expirada. Faça login novamente." },
      { status: 401 },
    );
  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl}/refresh`, {
      method: "PATCH",
      headers: { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json({ message: "Servidor temporariamente indisponível." }, { status: 503 });
  }
  const body = await upstream.text();
  if (!upstream.ok) {
    const response = new NextResponse(body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/json",
      },
    });
    const retryAfter = upstream.headers.get("Retry-After");
    if (retryAfter) response.headers.set("Retry-After", retryAfter);
    if (upstream.status === 401) {
      response.cookies.delete("refreshToken");
      response.cookies.delete("accessToken");
      response.cookies.delete("userRole");
    }
    return response;
  }
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
  setSessionCookies(response, data, userRole);
  return response;
}
