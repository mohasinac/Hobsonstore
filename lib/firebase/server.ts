/**
 * server.ts — Server-only read helpers using Firebase Admin SDK.
 *
 * All server components that need Firestore data MUST import from here, NOT
 * from the client-SDK files (content.ts / config.ts / collections.ts).
 * The client SDK hangs in Node.js build environments (no browser WebSocket).
 */
import "server-only";
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
function toData<T>(snap: FirebaseFirestore.QueryDocumentSnapshot<any>): T {
  return { id: snap.id, ...snap.data() } as T;
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export async function getBannersServer(): Promise<Banner[]> {
  const snap = await db()
    .collection(COLLECTIONS.BANNERS)
    .where("active", "==", true)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) => toData<Banner>(d));
}

export async function getPromoBannersServer(): Promise<PromoBanner[]> {
  const snap = await db()
    .collection(COLLECTIONS.PROMO_BANNERS)
    .where("active", "==", true)
    .orderBy("sortOrder", "asc")
    .limit(4)
    .get();
  return snap.docs.map((d) => toData<PromoBanner>(d));
}

// ─── Home sections ────────────────────────────────────────────────────────────

export async function getHomeSectionsServer(): Promise<HomeSection[]> {
  const snap = await db()
    .collection(COLLECTIONS.HOME_SECTIONS)
    .where("active", "==", true)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) => toData<HomeSection>(d));
}

// ─── Testimonials / FAQ ───────────────────────────────────────────────────────

export async function getTestimonialsServer(featuredOnly = false): Promise<Testimonial[]> {
  let ref = db()
    .collection(COLLECTIONS.TESTIMONIALS)
    .where("active", "==", true)
    .orderBy("sortOrder", "asc") as FirebaseFirestore.Query;
  if (featuredOnly) ref = ref.where("featured", "==", true);
  const snap = await ref.get();
  return snap.docs.map((d) => toData<Testimonial>(d));
}

export async function getFAQServer(): Promise<FAQItem[]> {
  const snap = await db()
    .collection(COLLECTIONS.FAQ)
    .where("active", "==", true)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) => toData<FAQItem>(d));
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function getAnnouncementsServer(): Promise<Announcement[]> {
  const snap = await db()
    .collection(COLLECTIONS.ANNOUNCEMENTS)
    .where("active", "==", true)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) => toData<Announcement>(d));
}

// ─── Pages / Blog ─────────────────────────────────────────────────────────────

export async function getPageServer(slug: string): Promise<ContentPage | null> {
  const snap = await db().collection(COLLECTIONS.PAGES).doc(slug).get();
  if (!snap.exists) return null;
  return snap.data() as ContentPage;
}

export async function getBlogPostServer(slug: string): Promise<BlogPost | null> {
  const snap = await db()
    .collection(COLLECTIONS.BLOG)
    .where("slug", "==", slug)
    .where("published", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return toData<BlogPost>(snap.docs[0]!);
}

export async function getAllBlogPostsServer(): Promise<BlogPost[]> {
  const snap = await db()
    .collection(COLLECTIONS.BLOG)
    .where("published", "==", true)
    .orderBy("publishedAt", "desc")
    .get();
  return snap.docs.map((d) => toData<BlogPost>(d));
}

// ─── Collections ──────────────────────────────────────────────────────────────

export async function getAllCollectionsServer(): Promise<Collection[]> {
  const snap = await db()
    .collection(COLLECTIONS.COLLECTIONS)
    .where("active", "==", true)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) => toData<Collection>(d));
}

export async function getCollectionServer(slug: string): Promise<Collection | null> {
  const snap = await db().collection(COLLECTIONS.COLLECTIONS).doc(slug).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as unknown as Collection;
}

export async function getActiveCollectionsByTypeServer(
  type: "franchise" | "brand",
): Promise<Collection[]> {
  const snap = await db()
    .collection(COLLECTIONS.COLLECTIONS)
    .where("type", "==", type)
    .where("active", "==", true)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) => toData<Collection>(d));
}

// ─── Site config ──────────────────────────────────────────────────────────────

export async function getSiteConfigServer(): Promise<SiteConfig | null> {
  const snap = await db().collection(COLLECTIONS.SITE_CONFIG).doc("main").get();
  if (!snap.exists) return null;
  return snap.data() as SiteConfig;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProductServer(slug: string): Promise<Product | null> {
  const snap = await db()
    .collection(COLLECTIONS.PRODUCTS)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return toData<Product>(snap.docs[0]!);
}

export async function getRelatedProductsServer(product: Product, count = 4): Promise<Product[]> {
  const snap = await db()
    .collection(COLLECTIONS.PRODUCTS)
    .where("franchise", "==", product.franchise)
    .where("inStock", "==", true)
    .limit(count + 1)
    .get();
  return snap.docs
    .map((d) => toData<Product>(d))
    .filter((p) => p.id !== product.id)
    .slice(0, count);
}

export async function searchProductsServer(searchQuery: string): Promise<Product[]> {
  if (!searchQuery.trim()) return [];
  const end = searchQuery + "\uf8ff";
  const snap = await db()
    .collection(COLLECTIONS.PRODUCTS)
    .where("name", ">=", searchQuery)
    .where("name", "<=", end)
    .limit(30)
    .get();
  return snap.docs.map((d) => toData<Product>(d));
}

export interface ProductFiltersServer {
  collectionSlug?: string;
  brand?: string;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "name_asc";
}

export async function getProductsServer(
  filters: ProductFiltersServer = {},
  pageSize = 24,
): Promise<Product[]> {
  let ref = db().collection(COLLECTIONS.PRODUCTS).where("active", "==", true) as FirebaseFirestore.Query;
  if (filters.collectionSlug) ref = ref.where("collections", "array-contains", filters.collectionSlug);
  if (filters.brand) ref = ref.where("brand", "==", filters.brand);
  if (filters.inStock) ref = ref.where("availableStock", ">", 0);
  if (filters.priceMin !== undefined) ref = ref.where("price", ">=", filters.priceMin);
  if (filters.priceMax !== undefined) ref = ref.where("price", "<=", filters.priceMax);

  switch (filters.sort) {
    case "price_asc":  ref = ref.orderBy("price", "asc"); break;
    case "price_desc": ref = ref.orderBy("price", "desc"); break;
    case "name_asc":   ref = ref.orderBy("name", "asc"); break;
    default:           ref = ref.orderBy("createdAt", "desc");
  }

  const snap = await ref.limit(pageSize).get();
  return snap.docs.map((d) => toData<Product>(d));
}
