import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  await fetch(`${apiUrl}/logout`, { method: "POST", headers: refreshToken ? { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` } : undefined }).catch(() => undefined);
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete("refreshToken");
  return response;
}
