import { NextResponse } from "next/server";

// Public GETs only. Never forward session cookies, tokens or arbitrary API paths.
export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const resource = path.join("/");
  const allowed = /^(stores|categories|subcategories|store\/[a-zA-Z0-9-]+(?:\/products)?|products\/[a-zA-Z0-9-]+)$/;
  if (!allowed.test(resource)) return NextResponse.json({ message: "Página não encontrada." }, { status: 404 });

  const upstream = new URL(`${process.env.NEXT_PUBLIC_API_URL || "https://vitrine-web-api.onrender.com"}/${resource}`);
  const incoming = new URL(request.url);
  for (const key of ["name", "page", "categoryId", "subcategoryId"]) {
    const value = incoming.searchParams.get(key);
    if (value) upstream.searchParams.set(key, value);
  }
  try {
    const response = await fetch(upstream, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) return NextResponse.json({ message: response.status === 404 ? "Não encontrado." : "Não foi possível carregar os dados. Tente novamente." }, { status: response.status });
    const headers = new Headers({ "Cache-Control": "no-store" });
    const total = response.headers.get("X-Total-Count");
    if (total) headers.set("X-Total-Count", total);
    return NextResponse.json(await response.json(), { headers });
  } catch {
    return NextResponse.json({ message: "Não foi possível carregar os dados. Tente novamente." }, { status: 503 });
  }
}
