/**
 * server.ts — Server-only read helpers using Firebase Admin SDK.
 *
 * All server components that need Firestore data MUST import from here, NOT
 * from the client-SDK files (content.ts / config.ts / collections.ts).
 * The client SDK hangs in Node.js build environments (no browser WebSocket).
 */
import "server-only";
import { cache } from "react";
import { getAdminDb } from "./admin";
import { COLLECTIONS } from "@/constants/firebase";
import type {
  Banner,
  HomeSection,
  Testimonial,
  FAQItem,
  Announcement,
  BlogPost,
  ContentPage,
  PromoBanner,
} from "@/types/content";
import type { Collection } from "@/types/content";
import type { SiteConfig } from "@/types/config";
import type { Product } from "@/types/product";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function db() {
  return getAdminDb();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeTimestamps(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  // Firestore Admin Timestamp has toDate()
  if (typeof obj.toDate === "function") return obj.toDate().toISOString();
  if (Array.isArray(obj)) return obj.map(serializeTimestamps);
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = serializeTimestamps(v);
    return out;
  }
  return obj;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toData<T>(snap: FirebaseFirestore.QueryDocumentSnapshot<any>): T {
  return serializeTimestamps({ id: snap.id, ...snap.data() }) as T;
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export const getBannersServer = cache(async function (): Promise<Banner[]> {
  const snap = await db()
    .collection(COLLECTIONS.BANNERS)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs
    .map((d) => toData<Banner>(d))
    .filter((b) => b.active);
});

export const getPromoBannersServer = cache(async function (): Promise<PromoBanner[]> {
  const snap = await db()
    .collection(COLLECTIONS.PROMO_BANNERS)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs
    .map((d) => toData<PromoBanner>(d))
    .filter((b) => b.active)
    .slice(0, 4);
});

// ─── Home sections ────────────────────────────────────────────────────────────

export const getHomeSectionsServer = cache(async function (): Promise<HomeSection[]> {
  const snap = await db()
    .collection(COLLECTIONS.HOME_SECTIONS)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs
    .map((d) => toData<HomeSection>(d))
    .filter((s) => s.active);
});

// ─── Testimonials / FAQ ───────────────────────────────────────────────────────

export const getTestimonialsServer = cache(async function (featuredOnly = false): Promise<Testimonial[]> {
  const snap = await db()
    .collection(COLLECTIONS.TESTIMONIALS)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs
    .map((d) => toData<Testimonial>(d))
    .filter((t) => t.active && (!featuredOnly || t.featured));
});

export const getFAQServer = cache(async function (): Promise<FAQItem[]> {
  const snap = await db()
    .collection(COLLECTIONS.FAQ)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs
    .map((d) => toData<FAQItem>(d))
    .filter((f) => f.active);
});

// ─── Announcements ────────────────────────────────────────────────────────────

export const getAnnouncementsServer = cache(async function (): Promise<Announcement[]> {
  const snap = await db()
    .collection(COLLECTIONS.ANNOUNCEMENTS)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs
    .map((d) => toData<Announcement>(d))
    .filter((a) => a.active);
});

// ─── Pages / Blog ─────────────────────────────────────────────────────────────

export const getPageServer = cache(async function (slug: string): Promise<ContentPage | null> {
  const snap = await db().collection(COLLECTIONS.PAGES).doc(slug).get();
  if (!snap.exists) return null;
  return serializeTimestamps({ id: snap.id, ...snap.data() }) as ContentPage;
});

export const getBlogPostServer = cache(async function (slug: string): Promise<BlogPost | null> {
  const snap = await db()
    .collection(COLLECTIONS.BLOG)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const post = toData<BlogPost>(snap.docs[0]!);
  if (!post.published) return null;
  return post;
});

export const getAllBlogPostsServer = cache(async function (): Promise<BlogPost[]> {
  const snap = await db()
    .collection(COLLECTIONS.BLOG)
    .orderBy("publishedAt", "desc")
    .get();
  return snap.docs
    .map((d) => toData<BlogPost>(d))
    .filter((p) => p.published);
});

// ─── Collections ──────────────────────────────────────────────────────────────

export const getAllCollectionsServer = cache(async function (): Promise<Collection[]> {
  const snap = await db()
    .collection(COLLECTIONS.COLLECTIONS)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs
    .map((d) => toData<Collection>(d))
    .filter((c) => c.active);
});

export const getCollectionServer = cache(async function (slug: string): Promise<Collection | null> {
  const snap = await db().collection(COLLECTIONS.COLLECTIONS).doc(slug).get();
  if (!snap.exists) return null;
  return serializeTimestamps({ id: snap.id, ...snap.data() }) as unknown as Collection;
});

export const getActiveCollectionsByTypeServer = cache(async function (
  type: "franchise" | "brand",
): Promise<Collection[]> {
  const snap = await db()
    .collection(COLLECTIONS.COLLECTIONS)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs
    .map((d) => toData<Collection>(d))
    .filter((c) => c.active && c.type === type);
});

// ─── Site config ──────────────────────────────────────────────────────────────

export const getSiteConfigServer = cache(async function (): Promise<SiteConfig | null> {
  const snap = await db().collection(COLLECTIONS.SITE_CONFIG).doc("main").get();
  if (!snap.exists) return null;
  return serializeTimestamps(snap.data()) as SiteConfig;
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProductServer = cache(async function (slug: string): Promise<Product | null> {
  const snap = await db()
    .collection(COLLECTIONS.PRODUCTS)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return toData<Product>(snap.docs[0]!);
});

export async function getRelatedProductsServer(product: Product, count = 4): Promise<Product[]> {
  const snap = await db()
    .collection(COLLECTIONS.PRODUCTS)
    .where("franchise", "==", product.franchise)
    .where("active", "==", true)
    .where("inStock", "==", true)
    .limit(count + 1)
    .get();
  return snap.docs
    .map((d) => toData<Product>(d))
    .filter((p) => p.id !== product.id)
    .slice(0, count);
}

export const searchProductsServer = cache(async function (searchQuery: string): Promise<Product[]> {
  if (!searchQuery.trim()) return [];
  const end = searchQuery + "\uf8ff";
  const snap = await db()
    .collection(COLLECTIONS.PRODUCTS)
    .where("active", "==", true)
    .where("name", ">=", searchQuery)
    .where("name", "<=", end)
    .limit(30)
    .get();
  return snap.docs.map((d) => toData<Product>(d));
});

export interface ProductFiltersServer {
  franchise?: string;
  brand?: string;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "name_asc";
}

export async function getProductsByIdsServer(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  // Firestore `in` supports max 30 per query — batch if needed
  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += 30) batches.push(ids.slice(i, i + 30));
  const results = await Promise.all(
    batches.map((batch) =>
      db().collection(COLLECTIONS.PRODUCTS).where("__name__", "in", batch).get(),
    ),
  );
  return results.flatMap((snap) => snap.docs.map((d) => toData<Product>(d)));
}

export async function getProductsServer(
  filters: ProductFiltersServer = {},
  pageSize = 24,
): Promise<Product[]> {
  let ref = db().collection(COLLECTIONS.PRODUCTS).where("active", "==", true) as FirebaseFirestore.Query;
  if (filters.franchise) ref = ref.where("franchise", "==", filters.franchise);
  if (filters.brand) ref = ref.where("brand", "==", filters.brand);
  if (filters.inStock) ref = ref.where("availableStock", ">", 0);
  if (filters.priceMin !== undefined) ref = ref.where("salePrice", ">=", filters.priceMin);
  if (filters.priceMax !== undefined) ref = ref.where("salePrice", "<=", filters.priceMax);

  switch (filters.sort) {
    case "price_asc":  ref = ref.orderBy("salePrice", "asc"); break;
    case "price_desc": ref = ref.orderBy("salePrice", "desc"); break;
    case "name_asc":   ref = ref.orderBy("name", "asc"); break;
    default:           ref = ref.orderBy("createdAt", "desc");
  }

  const snap = await ref.limit(pageSize).get();
  return snap.docs.map((d) => toData<Product>(d));
}

export const getFeaturedProductsServer = cache(async function (pageSize = 8): Promise<Product[]> {
  const snap = await db()
    .collection(COLLECTIONS.PRODUCTS)
    .where("isFeatured", "==", true)
    .where("active", "==", true)
    .limit(pageSize)
    .get();
  return snap.docs.map((d) => toData<Product>(d));
});

export const getBestsellerProductsServer = cache(async function (pageSize = 8): Promise<Product[]> {
  const snap = await db()
    .collection(COLLECTIONS.PRODUCTS)
    .where("isBestseller", "==", true)
    .where("active", "==", true)
    .limit(pageSize)
    .get();
  return snap.docs.map((d) => toData<Product>(d));
});

export const getNewArrivalsProductsServer = cache(async function (pageSize = 8): Promise<Product[]> {
  const snap = await db()
    .collection(COLLECTIONS.PRODUCTS)
    .where("active", "==", true)
    .orderBy("createdAt", "desc")
    .limit(pageSize)
    .get();
  return snap.docs.map((d) => toData<Product>(d));
});
