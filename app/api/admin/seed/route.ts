/**
 * /api/admin/seed
 *
 * Admin-only route (requires valid Firebase ID token with role === "admin").
 * GET  Ã¢â‚¬â€ returns live Firestore doc counts per entity collection.
 * POST Ã¢â‚¬â€ { action: "seed" | "delete", entities: string[] }
 *        Upserts or deletes seed data via Admin SDK, then revalidates ISR caches.
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminApp, getAdminDb } from "@/lib/firebase/admin";
import {
  SEED_PRODUCTS,
  SEED_COLLECTIONS,
  SEED_FRANCHISES,
  SEED_BRANDS,
  SEED_CURATED_COLLECTIONS,
  SEED_BANNERS,
  SEED_PROMO_BANNERS,
  SEED_HOME_SECTIONS,
  SEED_ANNOUNCEMENTS,
  SEED_TESTIMONIALS,
  SEED_FAQ,
  SEED_DISCOUNTS,
  SEED_ORDER_STATUS_CONFIG,
  SEED_PAGES,
  SEED_BLOG_POSTS,
  SEED_SITE_CONFIG,
  SEED_LOYALTY_CONFIG,
  SEED_PAYMENT_SETTINGS,
  SEED_SHIPPING_SETTINGS,
  SEED_NAVIGATION_CONFIG,
} from "@/scripts/seed-data";
import { COLLECTIONS } from "@/constants/firebase";

export const dynamic = "force-dynamic";

// Paths to revalidate after any write
const REVALIDATE_PATHS = ["/", "/blog", "/collections", "/search", "/products"];

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Auth helper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

async function verifyAdminToken(req: NextRequest): Promise<{ uid: string } | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAuth } = require("firebase-admin/auth");
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    const db = getAdminDb();
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userSnap.exists) return null;
    const role = (userSnap.data() as { role?: string })?.role;
    return role === "admin" ? { uid: decoded.uid } : null;
  } catch {
    return null;
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Write helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function serverTs() {
  return FieldValue.serverTimestamp();
}

type WriteBatch = FirebaseFirestore.WriteBatch;

async function commitInBatches(
  db: FirebaseFirestore.Firestore,
  writes: ((batch: WriteBatch) => void)[],
) {
  const BATCH_SIZE = 400;
  for (let i = 0; i < writes.length; i += BATCH_SIZE) {
    const batch = db.batch();
    writes.slice(i, i + BATCH_SIZE).forEach((fn) => fn(batch));
    await batch.commit();
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Count helper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

async function getCount(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
): Promise<number> {
  try {
    const snap = await db.collection(collectionName).count().get();
    return snap.data().count;
  } catch {
    return -1; // collection doesn't exist or count unsupported
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Entity seed/delete writers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

async function seedProducts(db: FirebaseFirestore.Firestore) {
  const writes = SEED_PRODUCTS.map((p) => {
    const { id, ...rest } = p;
    return (batch: WriteBatch) =>
      batch.set(
        db.collection(COLLECTIONS.PRODUCTS).doc(id),
        { ...rest, createdAt: serverTs(), updatedAt: serverTs() },
        { merge: true },
      );
  });
  await commitInBatches(db, writes);
}

async function deleteProducts(db: FirebaseFirestore.Firestore) {
  const writes = SEED_PRODUCTS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.PRODUCTS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedCollections(db: FirebaseFirestore.Firestore) {
  const writes = SEED_COLLECTIONS.map((c) => (batch: WriteBatch) =>
    batch.set(
      db.collection(COLLECTIONS.CURATED_COLLECTIONS).doc(c.slug),
      { ...c, updatedAt: serverTs() },
      { merge: true },
    ),
  );
  await commitInBatches(db, writes);
}

async function deleteCollections(db: FirebaseFirestore.Firestore) {
  const writes = SEED_COLLECTIONS.map(({ slug }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.CURATED_COLLECTIONS).doc(slug)),
  );
  await commitInBatches(db, writes);
}

async function seedFranchises(db: FirebaseFirestore.Firestore) {
  const writes = SEED_FRANCHISES.map((f) => (batch: WriteBatch) =>
    batch.set(
      db.collection(COLLECTIONS.FRANCHISES).doc(f.slug),
      { ...f, updatedAt: serverTs() },
      { merge: true },
    ),
  );
  await commitInBatches(db, writes);
}

async function deleteFranchises(db: FirebaseFirestore.Firestore) {
  const writes = SEED_FRANCHISES.map(({ slug }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.FRANCHISES).doc(slug)),
  );
  await commitInBatches(db, writes);
}

async function seedBrands(db: FirebaseFirestore.Firestore) {
  const writes = SEED_BRANDS.map((b) => (batch: WriteBatch) =>
    batch.set(
      db.collection(COLLECTIONS.BRANDS).doc(b.slug),
      { ...b, updatedAt: serverTs() },
      { merge: true },
    ),
  );
  await commitInBatches(db, writes);
}

async function deleteBrands(db: FirebaseFirestore.Firestore) {
  const writes = SEED_BRANDS.map(({ slug }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.BRANDS).doc(slug)),
  );
  await commitInBatches(db, writes);
}

async function seedCuratedCollections(db: FirebaseFirestore.Firestore) {
  const writes = SEED_CURATED_COLLECTIONS.map((c) => (batch: WriteBatch) =>
    batch.set(
      db.collection(COLLECTIONS.CURATED_COLLECTIONS).doc(c.slug),
      { ...c, updatedAt: serverTs() },
      { merge: true },
    ),
  );
  await commitInBatches(db, writes);
}

async function deleteCuratedCollections(db: FirebaseFirestore.Firestore) {
  const writes = SEED_CURATED_COLLECTIONS.map(({ slug }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.CURATED_COLLECTIONS).doc(slug)),
  );
  await commitInBatches(db, writes);
}

async function seedBanners(db: FirebaseFirestore.Firestore) {
  const writes = SEED_BANNERS.map(({ id, ...rest }) => (batch: WriteBatch) =>
    batch.set(db.collection(COLLECTIONS.BANNERS).doc(id), rest, { merge: true }),
  );
  await commitInBatches(db, writes);
}

async function deleteBanners(db: FirebaseFirestore.Firestore) {
  const writes = SEED_BANNERS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.BANNERS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedPromoBanners(db: FirebaseFirestore.Firestore) {
  const writes = SEED_PROMO_BANNERS.map(({ id, ...rest }) => (batch: WriteBatch) =>
    batch.set(db.collection(COLLECTIONS.PROMO_BANNERS).doc(id), rest, { merge: true }),
  );
  await commitInBatches(db, writes);
}

async function deletePromoBanners(db: FirebaseFirestore.Firestore) {
  const writes = SEED_PROMO_BANNERS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.PROMO_BANNERS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedHomeSections(db: FirebaseFirestore.Firestore) {
  const writes = SEED_HOME_SECTIONS.map(({ id, ...rest }) => (batch: WriteBatch) =>
    batch.set(db.collection(COLLECTIONS.HOME_SECTIONS).doc(id), rest, { merge: true }),
  );
  await commitInBatches(db, writes);
}

async function deleteHomeSections(db: FirebaseFirestore.Firestore) {
  const writes = SEED_HOME_SECTIONS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.HOME_SECTIONS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedAnnouncements(db: FirebaseFirestore.Firestore) {
  const writes = SEED_ANNOUNCEMENTS.map(({ id, ...rest }) => (batch: WriteBatch) =>
    batch.set(db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(id), rest, { merge: true }),
  );
  await commitInBatches(db, writes);
}

async function deleteAnnouncements(db: FirebaseFirestore.Firestore) {
  const writes = SEED_ANNOUNCEMENTS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedTestimonials(db: FirebaseFirestore.Firestore) {
  const writes = SEED_TESTIMONIALS.map(({ id, ...rest }) => (batch: WriteBatch) =>
    batch.set(db.collection(COLLECTIONS.TESTIMONIALS).doc(id), rest, { merge: true }),
  );
  await commitInBatches(db, writes);
}

async function deleteTestimonials(db: FirebaseFirestore.Firestore) {
  const writes = SEED_TESTIMONIALS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.TESTIMONIALS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedFAQ(db: FirebaseFirestore.Firestore) {
  const writes = SEED_FAQ.map(({ id, ...rest }) => (batch: WriteBatch) =>
    batch.set(db.collection(COLLECTIONS.FAQ).doc(id), rest, { merge: true }),
  );
  await commitInBatches(db, writes);
}

async function deleteFAQ(db: FirebaseFirestore.Firestore) {
  const writes = SEED_FAQ.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.FAQ).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedDiscounts(db: FirebaseFirestore.Firestore) {
  const writes = SEED_DISCOUNTS.map(({ id, ...rest }) => (batch: WriteBatch) =>
    batch.set(db.collection(COLLECTIONS.DISCOUNTS).doc(id), rest, { merge: true }),
  );
  await commitInBatches(db, writes);
}

async function deleteDiscounts(db: FirebaseFirestore.Firestore) {
  const writes = SEED_DISCOUNTS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.DISCOUNTS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedOrderStatusConfig(db: FirebaseFirestore.Firestore) {
  const writes = SEED_ORDER_STATUS_CONFIG.map(({ id, ...rest }) => (batch: WriteBatch) =>
    batch.set(db.collection(COLLECTIONS.ORDER_STATUS_CONFIG).doc(id), rest, { merge: true }),
  );
  await commitInBatches(db, writes);
}

async function deleteOrderStatusConfig(db: FirebaseFirestore.Firestore) {
  const writes = SEED_ORDER_STATUS_CONFIG.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.ORDER_STATUS_CONFIG).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedPages(db: FirebaseFirestore.Firestore) {
  const writes = SEED_PAGES.map(({ id, ...rest }) => (batch: WriteBatch) =>
    batch.set(
      db.collection(COLLECTIONS.PAGES).doc(id),
      { ...rest, updatedAt: serverTs() },
      { merge: true },
    ),
  );
  await commitInBatches(db, writes);
}

async function deletePages(db: FirebaseFirestore.Firestore) {
  const writes = SEED_PAGES.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.PAGES).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedBlogPosts(db: FirebaseFirestore.Firestore) {
  const now = serverTs();
  const writes = SEED_BLOG_POSTS.map(({ id, ...rest }) => (batch: WriteBatch) =>
    batch.set(
      db.collection(COLLECTIONS.BLOG).doc(id),
      { ...rest, publishedAt: now, updatedAt: now },
      { merge: true },
    ),
  );
  await commitInBatches(db, writes);
}

async function deleteBlogPosts(db: FirebaseFirestore.Firestore) {
  const writes = SEED_BLOG_POSTS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.BLOG).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedSiteConfig(db: FirebaseFirestore.Firestore) {
  const { _docId, ...rest } = SEED_SITE_CONFIG;
  await db.collection(COLLECTIONS.SITE_CONFIG).doc(_docId).set(rest, { merge: true });
}

async function seedLoyaltyConfig(db: FirebaseFirestore.Firestore) {
  const { _docId, ...rest } = SEED_LOYALTY_CONFIG;
  await db.collection(COLLECTIONS.LOYALTY_CONFIG).doc(_docId).set(rest, { merge: true });
}

async function seedPaymentSettings(db: FirebaseFirestore.Firestore) {
  const { _docId, ...rest } = SEED_PAYMENT_SETTINGS;
  await db.collection(COLLECTIONS.PAYMENT_SETTINGS).doc(_docId).set(rest, { merge: true });
}

async function seedShippingSettings(db: FirebaseFirestore.Firestore) {
  const { _docId, ...rest } = SEED_SHIPPING_SETTINGS;
  await db.collection(COLLECTIONS.SHIPPING_SETTINGS).doc(_docId).set(rest, { merge: true });
}

async function seedNavigationConfig(db: FirebaseFirestore.Firestore) {
  const { _docId, ...rest } = SEED_NAVIGATION_CONFIG;
  await db.collection(COLLECTIONS.NAVIGATION_CONFIG).doc(_docId).set(rest, { merge: true });
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Dispatch tables Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

type SeedFn = (db: FirebaseFirestore.Firestore) => Promise<void>;

const SEED_FNS: Record<string, SeedFn> = {
  products: seedProducts,
  collections: seedCollections,
  franchises: seedFranchises,
  brands: seedBrands,
  curatedCollections: seedCuratedCollections,
  banners: seedBanners,
  promobanners: seedPromoBanners,
  homeSections: seedHomeSections,
  announcements: seedAnnouncements,
  testimonials: seedTestimonials,
  faq: seedFAQ,
  discounts: seedDiscounts,
  orderStatusConfig: seedOrderStatusConfig,
  pages: seedPages,
  blogPosts: seedBlogPosts,
  siteConfig: seedSiteConfig,
  loyaltyConfig: seedLoyaltyConfig,
  paymentSettings: seedPaymentSettings,
  shippingSettings: seedShippingSettings,
  navigationConfig: seedNavigationConfig,
};

const DELETE_FNS: Record<string, SeedFn> = {
  products: deleteProducts,
  collections: deleteCollections,
  franchises: deleteFranchises,
  brands: deleteBrands,
  curatedCollections: deleteCuratedCollections,
  banners: deleteBanners,
  promobanners: deletePromoBanners,
  homeSections: deleteHomeSections,
  announcements: deleteAnnouncements,
  testimonials: deleteTestimonials,
  faq: deleteFAQ,
  discounts: deleteDiscounts,
  orderStatusConfig: deleteOrderStatusConfig,
  pages: deletePages,
  blogPosts: deleteBlogPosts,
};

// Collection names per entity key (for live count queries)
const ENTITY_COLLECTION: Record<string, string> = {
  products: COLLECTIONS.PRODUCTS,
  collections: COLLECTIONS.CURATED_COLLECTIONS,
  franchises: COLLECTIONS.FRANCHISES,
  brands: COLLECTIONS.BRANDS,
  curatedCollections: COLLECTIONS.CURATED_COLLECTIONS,
  banners: COLLECTIONS.BANNERS,
  promobanners: COLLECTIONS.PROMO_BANNERS,
  homeSections: COLLECTIONS.HOME_SECTIONS,
  announcements: COLLECTIONS.ANNOUNCEMENTS,
  testimonials: COLLECTIONS.TESTIMONIALS,
  faq: COLLECTIONS.FAQ,
  discounts: COLLECTIONS.DISCOUNTS,
  orderStatusConfig: COLLECTIONS.ORDER_STATUS_CONFIG,
  pages: COLLECTIONS.PAGES,
  blogPosts: COLLECTIONS.BLOG,
  siteConfig: COLLECTIONS.SITE_CONFIG,
  loyaltyConfig: COLLECTIONS.LOYALTY_CONFIG,
  paymentSettings: COLLECTIONS.PAYMENT_SETTINGS,
  shippingSettings: COLLECTIONS.SHIPPING_SETTINGS,
  navigationConfig: COLLECTIONS.NAVIGATION_CONFIG,
};

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Route handlers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export async function GET(req: NextRequest) {
  const admin = await verifyAdminToken(req);
  if (!admin) return unauthorized();

  const db = getAdminDb();
  const entityKeys = Object.keys(SEED_FNS);

  const counts = await Promise.all(
    entityKeys.map(async (key) => {
      const col = ENTITY_COLLECTION[key];
      return col ? getCount(db, col) : -1;
    }),
  );

  const countsMap: Record<string, number> = {};
  entityKeys.forEach((key, i) => {
    countsMap[key] = counts[i]!;
  });

  return NextResponse.json({
    entities: entityKeys,
    deleteSupported: Object.keys(DELETE_FNS),
    counts: countsMap,
  });
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdminToken(req);
  if (!admin) return unauthorized();

  let body: { action: string; entities: string[] };
  try {
    body = (await req.json()) as { action: string; entities: string[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, entities } = body;

  if (action !== "seed" && action !== "delete") {
    return NextResponse.json(
      { error: "action must be 'seed' or 'delete'" },
      { status: 400 },
    );
  }
  if (!Array.isArray(entities) || entities.length === 0) {
    return NextResponse.json(
      { error: "entities must be a non-empty array" },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  const fns = action === "seed" ? SEED_FNS : DELETE_FNS;

  const unknown = entities.filter((e) => !fns[e]);
  const known = entities.filter((e) => !!fns[e]);

  const settled = await Promise.allSettled(known.map((e) => fns[e]!(db)));

  const results: Record<string, "ok" | string> = {};
  for (const e of unknown) {
    results[e] = `unknown entity '${e}'`;
  }
  known.forEach((e, i) => {
    const outcome = settled[i]!;
    results[e] =
      outcome.status === "fulfilled"
        ? "ok"
        : outcome.reason instanceof Error
          ? outcome.reason.message
          : String(outcome.reason);
  });

  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path, "layout");
  }

  const hasErrors = Object.values(results).some((v) => v !== "ok");
  return NextResponse.json(
    { action, results, revalidated: REVALIDATE_PATHS },
    { status: hasErrors ? 207 : 200 },
  );
}