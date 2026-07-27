import { CatalogClient } from '@/features/catalog/components/catalog-client'
import { fetchCategoriesWithSubcategories } from '@/features/catalog/api/fetch-categories'
import { fetchProducts } from '@/features/catalog/api/fetch-products'

interface HomePageProps {
  searchParams: Promise<{
    name?: string
    categoryId?: string
    subcategoryId?: string
    page?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const parsedPage = Number.parseInt(params.page ?? '1', 10)
  const queryParams = {
    name: params.name,
    categoryId: params.categoryId,
    subcategoryId: params.subcategoryId,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  }
  const [initialProducts, initialCategories] = await Promise.all([
    fetchProducts(queryParams),
    fetchCategoriesWithSubcategories(),
  ])

  return <CatalogClient initialProducts={initialProducts} initialCategories={initialCategories} queryParams={queryParams} />
}
