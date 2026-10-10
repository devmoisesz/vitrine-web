import type { NextResponse } from "next/server";

export function setSessionCookies(
  response: NextResponse,
  session: { access_token: string; refresh_token?: string },
  role: string | null,
) {
  const options = {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  response.cookies.set("accessToken", session.access_token, { ...options, maxAge: 15 * 60 });
  if (session.refresh_token) {
    response.cookies.set("refreshToken", session.refresh_token, { ...options, maxAge: 60 * 60 });
  }
  if (role) response.cookies.set("userRole", role, { ...options, maxAge: 60 * 60 });
  else response.cookies.delete("userRole");
}
