import { permanentRedirect } from "next/navigation";
import { storeDiscoveryHref } from "@/lib/store-discovery";

export default async function CataloguePage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value) && value.length) query.set(key, key === "segments" ? value.join(",") : value[0]);
  }
  permanentRedirect(storeDiscoveryHref(query));
}
