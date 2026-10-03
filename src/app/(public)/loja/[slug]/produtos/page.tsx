import { Storefront } from "@/components/store/storefront";

export default async function StoreProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Storefront key={slug} slug={slug} catalogOnly />;
}
