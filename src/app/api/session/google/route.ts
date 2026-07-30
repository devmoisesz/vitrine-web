import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(request: Request) {
  const upstream = await fetch(`${apiUrl}/authenticate/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
  });
  const body = await upstream.text();
  if (!upstream.ok) return new NextResponse(body, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" } });
  const data = JSON.parse(body) as { access_token: string; refresh_token: string };
  const response = NextResponse.json({ access_token: data.access_token });
  response.cookies.set("refreshToken", data.refresh_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return response;
}
