/**
 * server.ts — Server-only read helpers using Firebase Admin SDK.
 *
 * All server components that need Firestore data MUST import from here, NOT
 * from the client-SDK files (content.ts / config.ts / collections.ts).
 * The client SDK hangs in Node.js build environments (no browser WebSocket).
 */
import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
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
  Collection,
  CharacterHotspotConfig,
  TrustBadge,
} from "@/types/content";
import type { SiteConfig, IntegrationKeys } from "@/types/config";
import type { Product } from "@/types/product";
import type { Franchise } from "@/types/franchise";
import type { Brand } from "@/types/brand";

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

export const getBannersServer = unstable_cache(
  async function (): Promise<Banner[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.BANNERS)
        .orderBy("sortOrder", "asc")
        .get();
      return snap.docs.map((d) => toData<Banner>(d)).filter((b) => b.active);
    } catch {
      return [];
    }
  },
  ["banners"],
  { revalidate: 300, tags: ["content", "banners"] },
);

export const getPromoBannersServer = unstable_cache(
  async function (): Promise<PromoBanner[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.PROMO_BANNERS)
        .orderBy("sortOrder", "asc")
        .get();
      return snap.docs
        .map((d) => toData<PromoBanner>(d))
        .filter((b) => b.active)
        .slice(0, 4);
    } catch {
    return [];
    }
  },
  ["promo-banners"],
  { revalidate: 300, tags: ["content", "promo-banners"] },
);

// ─── Home sections ────────────────────────────────────────────────────────────

export const getHomeSectionsServer = unstable_cache(
  async function (): Promise<HomeSection[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.HOME_SECTIONS)
        .orderBy("sortOrder", "asc")
        .get();
      return snap.docs.map((d) => toData<HomeSection>(d)).filter((s) => s.active);
    } catch {
      return [];
    }
  },
  ["home-sections"],
  { revalidate: 300, tags: ["content", "home-sections"] },
);

// ─── Testimonials / FAQ ───────────────────────────────────────────────────────

export const getTestimonialsServer = unstable_cache(
  async function (featuredOnly = false): Promise<Testimonial[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.TESTIMONIALS)
        .orderBy("sortOrder", "asc")
        .get();
      return snap.docs
        .map((d) => toData<Testimonial>(d))
        .filter((t) => t.active && (!featuredOnly || t.featured));
    } catch {
      return [];
    }
  },
  ["testimonials"],
  { revalidate: 300, tags: ["content", "testimonials"] },
);

export const getFAQServer = unstable_cache(
  async function (): Promise<FAQItem[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.FAQ)
        .orderBy("sortOrder", "asc")
        .get();
      return snap.docs.map((d) => toData<FAQItem>(d)).filter((f) => f.active);
    } catch {
      return [];
    }
  },
  ["faq"],
  { revalidate: 300, tags: ["content", "faq"] },
);

// ─── Announcements ────────────────────────────────────────────────────────────

export const getAnnouncementsServer = unstable_cache(
  async function (): Promise<Announcement[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.ANNOUNCEMENTS)
        .orderBy("sortOrder", "asc")
        .get();
      return snap.docs.map((d) => toData<Announcement>(d)).filter((a) => a.active);
    } catch {
      return [];
    }
  },
  ["announcements"],
  { revalidate: 300, tags: ["content", "announcements"] },
);

// ─── Pages / Blog ─────────────────────────────────────────────────────────────

export const getPageServer = cache(async function (slug: string): Promise<ContentPage | null> {
  try {
    const snap = await db().collection(COLLECTIONS.PAGES).doc(slug).get();
    if (!snap.exists) return null;
    return serializeTimestamps({ id: snap.id, ...snap.data() }) as ContentPage;
  } catch {
    return null;
  }
});

export const getBlogPostServer = cache(async function (slug: string): Promise<BlogPost | null> {
  try {
    const snap = await db()
      .collection(COLLECTIONS.BLOG)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const post = toData<BlogPost>(snap.docs[0]!);
    if (!post.published) return null;
    return post;
  } catch {
    return null;
  }
});

export const getAllBlogPostsServer = unstable_cache(
  async function (): Promise<BlogPost[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.BLOG)
        .orderBy("publishedAt", "desc")
        .get();
      return snap.docs.map((d) => toData<BlogPost>(d)).filter((p) => p.published);
    } catch {
      return [];
    }
  },
  ["blog-posts"],
  { revalidate: 300, tags: ["content", "blog"] },
);

// ─── Collections ──────────────────────────────────────────────────────────────

export const getAllCollectionsServer = unstable_cache(
  async function (): Promise<Collection[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.CURATED_COLLECTIONS)
        .orderBy("sortOrder", "asc")
        .get();
      return snap.docs.map((d) => toData<Collection>(d)).filter((c) => c.active);
    } catch {
      return [];
    }
  },
  ["collections"],
  { revalidate: 300, tags: ["content", "collections"] },
);

export const getCollectionServer = unstable_cache(
  async function (slug: string): Promise<Collection | null> {
    try {
      const snap = await db().collection(COLLECTIONS.CURATED_COLLECTIONS).doc(slug).get();
      if (!snap.exists) return null;
      return serializeTimestamps({ id: snap.id, ...snap.data() }) as unknown as Collection;
    } catch {
      return null;
    }
  },
  ["collection"],
  { revalidate: 300, tags: ["content", "collections"] },
);

// ─── Franchises ──────────────────────────────────────────────────────────────

export const getAllFranchisesServer = unstable_cache(
  async function (): Promise<Franchise[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.FRANCHISES)
        .orderBy("sortOrder", "asc")
        .get();
      return snap.docs.map((d) => toData<Franchise>(d)).filter((f) => f.active);
    } catch {
      return [];
    }
  },
  ["franchises"],
  { revalidate: 300, tags: ["content", "franchises"] },
);

export const getFranchiseServer = unstable_cache(
  async function (slug: string): Promise<Franchise | null> {
    try {
      const snap = await db().collection(COLLECTIONS.FRANCHISES).doc(slug).get();
      if (!snap.exists) return null;
      return serializeTimestamps({ ...snap.data() }) as Franchise;
    } catch {
      return null;
    }
  },
  ["franchise"],
  { revalidate: 300, tags: ["content", "franchises"] },
);

// ─── Brands ───────────────────────────────────────────────────────────────────

export const getAllBrandsServer = unstable_cache(
  async function (): Promise<Brand[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.BRANDS)
        .orderBy("sortOrder", "asc")
        .get();
      return snap.docs.map((d) => toData<Brand>(d)).filter((b) => b.active);
    } catch {
      return [];
    }
  },
  ["brands"],
  { revalidate: 300, tags: ["content", "brands"] },
);

export const getBrandServer = unstable_cache(
  async function (slug: string): Promise<Brand | null> {
    try {
      const snap = await db().collection(COLLECTIONS.BRANDS).doc(slug).get();
      if (!snap.exists) return null;
      return serializeTimestamps({ ...snap.data() }) as Brand;
    } catch {
      return null;
    }
  },
  ["brand"],
  { revalidate: 300, tags: ["content", "brands"] },
);

// ─── Site config ──────────────────────────────────────────────────────────────

export const getSiteConfigServer = unstable_cache(
  async function (): Promise<SiteConfig | null> {
    try {
      const snap = await db().collection(COLLECTIONS.SITE_CONFIG).doc("main").get();
      if (!snap.exists) return null;
      return serializeTimestamps(snap.data()) as SiteConfig;
    } catch {
      return null;
    }
  },
  ["site-config"],
  { revalidate: 300, tags: ["content", "site-config"] },
);

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProductServer = cache(async function (slug: string): Promise<Product | null> {
  try {
    // Try slug field first (primary lookup)
    const snap = await db()
      .collection(COLLECTIONS.PRODUCTS)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (!snap.empty) return toData<Product>(snap.docs[0]!);

    // Fallback: try document ID directly (handles cases where slug === doc id)
    const docSnap = await db().collection(COLLECTIONS.PRODUCTS).doc(slug).get();
    if (docSnap.exists) return { id: docSnap.id, ...docSnap.data() } as Product;

    return null;
  } catch (err) {
    console.error("[getProductServer] Firestore error for slug:", slug, err);
    return null;
  }
});

const _getRelatedProductsCached = unstable_cache(
  async (franchise: string, excludeId: string, count: number): Promise<Product[]> => {
    try {
      const snap = await db()
        .collection(COLLECTIONS.PRODUCTS)
        .where("franchise", "==", franchise)
        .where("active", "==", true)
        .where("inStock", "==", true)
        .limit(count + 1)
        .get();
      return snap.docs
        .map((d) => toData<Product>(d))
        .filter((p) => p.id !== excludeId)
        .slice(0, count);
    } catch {
      return [];
    }
  },
  ["related-products"],
  { revalidate: 300, tags: ["products"] },
);

export async function getRelatedProductsServer(product: Product, count = 4): Promise<Product[]> {
  return _getRelatedProductsCached(product.franchise, product.id, count);
}

export const searchProductsServer = cache(async function (searchQuery: string): Promise<Product[]> {
  if (!searchQuery.trim()) return [];
  try {
    const end = searchQuery + "\uf8ff";
    const snap = await db()
      .collection(COLLECTIONS.PRODUCTS)
      .where("active", "==", true)
      .where("name", ">=", searchQuery)
      .where("name", "<=", end)
      .limit(30)
      .get();
    return snap.docs.map((d) => toData<Product>(d));
  } catch {
    return [];
  }
});

export interface ProductFiltersServer {
  franchise?: string;
  brand?: string;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "name_asc";
}

const _getProductsByIdsCached = unstable_cache(
  async (idsJson: string): Promise<Product[]> => {
    const ids: string[] = JSON.parse(idsJson);
    try {
      // Firestore `in` supports max 30 per query — batch if needed
      const batches: string[][] = [];
      for (let i = 0; i < ids.length; i += 30) batches.push(ids.slice(i, i + 30));
      const results = await Promise.all(
        batches.map((batch) =>
          db().collection(COLLECTIONS.PRODUCTS).where("__name__", "in", batch).get(),
        ),
      );
      return results.flatMap((snap) => snap.docs.map((d) => toData<Product>(d)));
    } catch {
      return [];
    }
  },
  ["products-by-ids"],
  { revalidate: 300, tags: ["products"] },
);

export async function getProductsByIdsServer(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  return _getProductsByIdsCached(JSON.stringify([...ids].sort()));
}

const _getProductsServerCached = unstable_cache(
  async (filtersJson: string, pageSize: number): Promise<Product[]> => {
    const filters = JSON.parse(filtersJson) as ProductFiltersServer;
    try {
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
    } catch {
      return [];
    }
  },
  ["products-list"],
  { revalidate: 120, tags: ["products"] },
);

export async function getProductsServer(
  filters: ProductFiltersServer = {},
  pageSize = 24,
): Promise<Product[]> {
  return _getProductsServerCached(JSON.stringify(filters), pageSize);
}

const _getFeaturedProductsCached = unstable_cache(
  async (pageSize: number): Promise<Product[]> => {
    try {
      const snap = await db()
        .collection(COLLECTIONS.PRODUCTS)
        .where("isFeatured", "==", true)
        .where("active", "==", true)
        .limit(pageSize)
        .get();
      return snap.docs.map((d) => toData<Product>(d));
    } catch {
      return [];
    }
  },
  ["featured-products"],
  { revalidate: 120, tags: ["products"] },
);

export async function getFeaturedProductsServer(pageSize = 8): Promise<Product[]> {
  return _getFeaturedProductsCached(pageSize);
}

const _getBestsellerProductsCached = unstable_cache(
  async (pageSize: number): Promise<Product[]> => {
    try {
      const snap = await db()
        .collection(COLLECTIONS.PRODUCTS)
        .where("isBestseller", "==", true)
        .where("active", "==", true)
        .limit(pageSize)
        .get();
      return snap.docs.map((d) => toData<Product>(d));
    } catch {
      return [];
    }
  },
  ["bestseller-products"],
  { revalidate: 120, tags: ["products"] },
);

export async function getBestsellerProductsServer(pageSize = 8): Promise<Product[]> {
  return _getBestsellerProductsCached(pageSize);
}

const _getNewArrivalsCached = unstable_cache(
  async (pageSize: number): Promise<Product[]> => {
    try {
      const snap = await db()
        .collection(COLLECTIONS.PRODUCTS)
        .where("active", "==", true)
        .orderBy("createdAt", "desc")
        .limit(pageSize)
        .get();
      return snap.docs.map((d) => toData<Product>(d));
    } catch {
      return [];
    }
  },
  ["new-arrivals"],
  { revalidate: 120, tags: ["products"] },
);

export async function getNewArrivalsProductsServer(pageSize = 8): Promise<Product[]> {
  return _getNewArrivalsCached(pageSize);
}

// ─── Integration Keys ─────────────────────────────────────────────────────────

/** Read the `integrationKeys/main` document. Returns empty object if not found. */
export async function getIntegrationKeysServer(): Promise<IntegrationKeys> {
  try {
    const snap = await db().collection(COLLECTIONS.INTEGRATION_KEYS).doc("main").get();
    if (!snap.exists) return {};
    return serializeTimestamps(snap.data()) as IntegrationKeys;
  } catch {
    return {};
  }
}

/** Merge-update the `integrationKeys/main` document. */
export async function updateIntegrationKeysServer(updates: Partial<IntegrationKeys>): Promise<void> {
  await db().collection(COLLECTIONS.INTEGRATION_KEYS).doc("main").set(updates, { merge: true });
}

// ─── Character Hotspot ───────────────────────────────────────────────────────────

export const getCharacterHotspotConfigServer = unstable_cache(
  async function (): Promise<CharacterHotspotConfig | null> {
    try {
      const snap = await db().collection(COLLECTIONS.CHARACTER_HOTSPOT).doc("main").get();
      if (!snap.exists) return null;
      return serializeTimestamps(snap.data()) as CharacterHotspotConfig;
    } catch {
      return null;
    }
  },
  ["character-hotspot"],
  { revalidate: 300, tags: ["content", "character-hotspot"] },
);

// ─── Trust Badges ────────────────────────────────────────────────

export const getTrustBadgesServer = unstable_cache(
  async function (): Promise<TrustBadge[]> {
    try {
      const snap = await db()
        .collection(COLLECTIONS.TRUST_BADGES)
        .orderBy("sortOrder", "asc")
        .get();
      return snap.docs.map((d) => toData<TrustBadge>(d)).filter((b) => b.active);
    } catch {
      return [];
    }
  },
  ["trust-badges"],
  { revalidate: 300, tags: ["content", "trust-badges"] },
);

