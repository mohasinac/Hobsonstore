import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/firebase";

// Never prerender — this route calls the Admin SDK which needs runtime credentials.
export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://fatcatcollectibles.in";

async function getSlugs(
  collectionName: string,
  slugField: string,
  extraFilters?: { field: string; value: unknown }[],
): Promise<string[]> {
  const db = getAdminDb();
  let ref = db.collection(collectionName) as FirebaseFirestore.Query;
  if (extraFilters) {
    for (const f of extraFilters) {
      ref = ref.where(f.field, "==", f.value);
    }
  }
  const snap = await ref.select(slugField).get();
  return snap.docs
    .map((d) => d.get(slugField) as string | undefined)
    .filter((s): s is string => typeof s === "string" && s.length > 0);
}

/**
 * GET /api/sitemap
 * Returns a dynamic XML sitemap built from Firestore slugs.
 * Cached for 1 hour; on-demand revalidation via /api/revalidate.
 */
export async function GET() {
  let productSlugs: string[] = [];
  let collectionSlugs: string[] = [];
  let blogSlugs: string[] = [];

  try {
    [productSlugs, collectionSlugs, blogSlugs] = await Promise.all([
      getSlugs(COLLECTIONS.PRODUCTS, "slug"),
      getSlugs(COLLECTIONS.COLLECTIONS, "slug", [{ field: "active", value: true }]),
      getSlugs(COLLECTIONS.BLOG, "slug", [{ field: "published", value: true }]),
    ]);
  } catch {
    // Admin SDK unavailable (e.g. no credentials) — return a minimal sitemap
  }

  const staticPaths = [
    "/",
    "/collections",
    "/search",
    "/blog",
    "/about",
    "/contact",
    "/policies/terms-of-service",
    "/policies/privacy-policy",
    "/policies/shipping-policy",
    "/policies/refund-policy",
  ];

  const allPaths = [
    ...staticPaths,
    ...productSlugs.map((s) => `/products/${s}`),
    ...collectionSlugs.map((s) => `/collections/${s}`),
    ...blogSlugs.map((s) => `/blog/${s}`),
  ];

  const today = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
  .map(
    (path) => `  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path === "/" ? "daily" : "weekly"}</changefreq>
    <priority>${path === "/" ? "1.0" : path.startsWith("/products/") ? "0.8" : "0.6"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
