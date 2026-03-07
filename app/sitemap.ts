import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/firebase/content";
import { getAllCollections } from "@/lib/firebase/collections";
import { getProducts } from "@/lib/firebase/products";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://fatcatcollectibles.in";

export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, { products }, posts] = await Promise.all([
    getAllCollections().catch(() => []),
    getProducts({}, 500).catch(() => ({ products: [], lastDoc: null })),
    getAllBlogPosts().catch(() => []),
  ]);

  const today = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: today, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/collections`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: today, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/policies/terms-of-service`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/policies/privacy-policy`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/policies/shipping-policy`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/policies/refund-policy`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${BASE_URL}/collections/${c.slug}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes, ...blogRoutes];
}
