import { HomeClient } from "./home-client";
import { fetchCategoriesWithSubcategories } from "@/features/catalog/api/fetch-categories";
import { fetchProducts } from "@/features/catalog/api/fetch-products";
import { fetchHomeStores } from "@/features/home/api/fetch-home-stores";

interface HomePageProps {
  searchParams: Promise<{
    name?: string;
    categoryId?: string;
    subcategoryId?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const queryParams = {
    name: params.name,
    categoryId: params.categoryId,
    subcategoryId: params.subcategoryId,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
  const hasFilters = Boolean(
    queryParams.name || queryParams.categoryId || queryParams.subcategoryId,
  );
  const [initialCategories, initialProducts, initialStores] = await Promise.all(
    [
      fetchCategoriesWithSubcategories(),
      hasFilters ? fetchProducts(queryParams) : Promise.resolve(undefined),
      hasFilters
        ? Promise.resolve(undefined)
        : fetchHomeStores(queryParams.page),
    ],
  );

  return (
    <HomeClient
      initialCategories={initialCategories}
      queryParams={queryParams}
      initialProducts={initialProducts}
      initialStores={initialStores}
    />
  );
}
