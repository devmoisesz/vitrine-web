import { apiClient } from "@/lib/api-client";
import type { Category, CategoryWithSubcategories, Subcategory } from "@/types/catalog";

export async function fetchAdminCategories(): Promise<CategoryWithSubcategories[]> {
  const [categories, subcategories] = await Promise.all([
    apiClient<Category[]>("/categories", { method: "GET", credentials: "include" }),
    apiClient<Subcategory[]>("/subcategories", { method: "GET", credentials: "include" }),
  ]);
  return categories.map((category) => ({ ...category, subcategories: subcategories.filter((subcategory) => subcategory.categoryId === category.id) }));
}

export function registerCategory({ name }: { name: string }) {
  return apiClient<void>("/categories", {
    method: "POST",
    authenticated: true,
    credentials: "include",
    body: { name },
  });
}

export function registerSubcategory({ categorySlug, name }: { categorySlug: string; name: string }) {
  return apiClient<void>(`/categories/${encodeURIComponent(categorySlug)}/subcategory`, {
    method: "POST",
    authenticated: true,
    credentials: "include",
    body: { name },
  });
}

export function updateCategory({ slug, name }: { slug: string; name: string }) {
  return apiClient<void>(`/categories/${encodeURIComponent(slug)}/edit`, {
    method: "PUT",
    authenticated: true,
    credentials: "include",
    body: { name },
  });
}

export function updateSubcategory({ categorySlug, id, name }: { categorySlug: string; id: string; name: string }) {
  return apiClient<void>(`/categories/${encodeURIComponent(categorySlug)}/subcategories/${encodeURIComponent(id)}`, {
    method: "PUT",
    authenticated: true,
    credentials: "include",
    body: { name },
  });
}
