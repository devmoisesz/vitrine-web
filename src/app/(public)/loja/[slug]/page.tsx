import { Storefront } from "@/components/store/storefront";

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Storefront key={slug} slug={slug} />;
}
