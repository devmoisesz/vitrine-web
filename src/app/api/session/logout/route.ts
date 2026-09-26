import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  try {
    const upstream = await fetch(`${apiUrl}/logout`, {
      method: "POST",
      headers: refreshToken
        ? { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` }
        : undefined,
    });
    if (!upstream.ok) throw new Error("Logout failed");
  } catch {
    // Keep the cookie so the user can retry revocation.
    return NextResponse.json(
      { message: "Não foi possível encerrar sua sessão. Tente novamente." },
      { status: 502 },
    );
  }
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete("refreshToken");
  response.cookies.delete("accessToken");
  response.cookies.delete("userRole");
  return response;
}
