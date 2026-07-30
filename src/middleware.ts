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
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refreshToken")?.value;
  const pem = getPublicKey();

  if (!refreshToken || !pem) {
    return NextResponse.redirect(new URL("/login?redirect=/admin", request.url));
  }

  try {
    const key = await importSPKI(pem, "RS256");
    const { payload } = await jwtVerify(refreshToken, key);

    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login?redirect=/admin", request.url));
  }
}

export const config = {
  matcher: "/admin/:path*",
};
