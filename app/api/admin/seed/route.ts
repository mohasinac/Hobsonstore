/**
 * POST /api/admin/seed
 *
 * DEV-ONLY public route — returns 404 in production.
 * Upserts or deletes seed data using the Firebase Admin SDK,
 * then revalidates affected Next.js cache paths.
 *
 * Body:  { action: "seed" | "delete", entities: string[] }
 * GET:   returns supported entity keys (for the seed UI to discover)
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  SEED_PRODUCTS,
  SEED_COLLECTIONS,
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
} from "@/scripts/seed-data";
import { COLLECTIONS } from "@/constants/firebase";

export const dynamic = "force-dynamic";

const IS_DEV = process.env.NODE_ENV === "development";

function devOnly() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

// Paths to revalidate after any write — keeps Next.js ISR caches fresh
const REVALIDATE_PATHS = ["/", "/blog", "/collections", "/search", "/products"];

// ─── Write helpers ────────────────────────────────────────────────────────────

function serverTs() {
  return FieldValue.serverTimestamp();
}

function expiryTs(dateStr: string) {
  return Timestamp.fromDate(new Date(dateStr));
}

type WriteBatch = FirebaseFirestore.WriteBatch;

async function commitInBatches(
  db: FirebaseFirestore.Firestore,
  writes: ((batch: WriteBatch) => void)[],
) {
  const BATCH_SIZE = 400; // Firestore limit is 500
  for (let i = 0; i < writes.length; i += BATCH_SIZE) {
    const batch = db.batch();
    writes.slice(i, i + BATCH_SIZE).forEach((fn) => fn(batch));
    await batch.commit();
  }
}

// ─── Entity writers ───────────────────────────────────────────────────────────

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
      db.collection(COLLECTIONS.COLLECTIONS).doc(c.slug),
      { ...c, updatedAt: serverTs() },
      { merge: true },
    ),
  );
  await commitInBatches(db, writes);
}

async function deleteCollections(db: FirebaseFirestore.Firestore) {
  const writes = SEED_COLLECTIONS.map(({ slug }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.COLLECTIONS).doc(slug)),
  );
  await commitInBatches(db, writes);
}

async function seedBanners(db: FirebaseFirestore.Firestore) {
  const writes = SEED_BANNERS.map((b) => {
    const { id, ...rest } = b;
    return (batch: WriteBatch) =>
      batch.set(db.collection(COLLECTIONS.BANNERS).doc(id), rest, { merge: true });
  });
  await commitInBatches(db, writes);
}

async function deleteBanners(db: FirebaseFirestore.Firestore) {
  const writes = SEED_BANNERS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.BANNERS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedPromoBanners(db: FirebaseFirestore.Firestore) {
  const writes = SEED_PROMO_BANNERS.map((b) => {
    const { id, ...rest } = b;
    return (batch: WriteBatch) =>
      batch.set(db.collection(COLLECTIONS.PROMO_BANNERS).doc(id), rest, { merge: true });
  });
  await commitInBatches(db, writes);
}

async function deletePromoBanners(db: FirebaseFirestore.Firestore) {
  const writes = SEED_PROMO_BANNERS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.PROMO_BANNERS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedHomeSections(db: FirebaseFirestore.Firestore) {
  const writes = SEED_HOME_SECTIONS.map((s) => {
    const { id, ...rest } = s;
    return (batch: WriteBatch) =>
      batch.set(db.collection(COLLECTIONS.HOME_SECTIONS).doc(id), rest, { merge: true });
  });
  await commitInBatches(db, writes);
}

async function deleteHomeSections(db: FirebaseFirestore.Firestore) {
  const writes = SEED_HOME_SECTIONS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.HOME_SECTIONS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedAnnouncements(db: FirebaseFirestore.Firestore) {
  const writes = SEED_ANNOUNCEMENTS.map((a) => {
    const { id, ...rest } = a;
    return (batch: WriteBatch) =>
      batch.set(db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(id), rest, { merge: true });
  });
  await commitInBatches(db, writes);
}

async function deleteAnnouncements(db: FirebaseFirestore.Firestore) {
  const writes = SEED_ANNOUNCEMENTS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedTestimonials(db: FirebaseFirestore.Firestore) {
  const writes = SEED_TESTIMONIALS.map((t) => {
    const { id, ...rest } = t;
    return (batch: WriteBatch) =>
      batch.set(db.collection(COLLECTIONS.TESTIMONIALS).doc(id), rest, { merge: true });
  });
  await commitInBatches(db, writes);
}

async function deleteTestimonials(db: FirebaseFirestore.Firestore) {
  const writes = SEED_TESTIMONIALS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.TESTIMONIALS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedFAQ(db: FirebaseFirestore.Firestore) {
  const writes = SEED_FAQ.map((f) => {
    const { id, ...rest } = f;
    return (batch: WriteBatch) =>
      batch.set(db.collection(COLLECTIONS.FAQ).doc(id), rest, { merge: true });
  });
  await commitInBatches(db, writes);
}

async function deleteFAQ(db: FirebaseFirestore.Firestore) {
  const writes = SEED_FAQ.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.FAQ).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedDiscounts(db: FirebaseFirestore.Firestore) {
  const writes = SEED_DISCOUNTS.map((d) => {
    const { id, ...rest } = d;
    return (batch: WriteBatch) =>
      batch.set(db.collection(COLLECTIONS.DISCOUNTS).doc(id), rest, { merge: true });
  });
  await commitInBatches(db, writes);
}

async function deleteDiscounts(db: FirebaseFirestore.Firestore) {
  const writes = SEED_DISCOUNTS.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.DISCOUNTS).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedOrderStatusConfig(db: FirebaseFirestore.Firestore) {
  const writes = SEED_ORDER_STATUS_CONFIG.map((s) => {
    const { id, ...rest } = s;
    return (batch: WriteBatch) =>
      batch.set(db.collection(COLLECTIONS.ORDER_STATUS_CONFIG).doc(id), rest, { merge: true });
  });
  await commitInBatches(db, writes);
}

async function deleteOrderStatusConfig(db: FirebaseFirestore.Firestore) {
  const writes = SEED_ORDER_STATUS_CONFIG.map(({ id }) => (batch: WriteBatch) =>
    batch.delete(db.collection(COLLECTIONS.ORDER_STATUS_CONFIG).doc(id)),
  );
  await commitInBatches(db, writes);
}

async function seedPages(db: FirebaseFirestore.Firestore) {
  const writes = SEED_PAGES.map((p) => {
    const { id, ...rest } = p;
    return (batch: WriteBatch) =>
      batch.set(
        db.collection(COLLECTIONS.PAGES).doc(id),
        { ...rest, updatedAt: serverTs() },
        { merge: true },
      );
  });
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
  const writes = SEED_BLOG_POSTS.map((post) => {
    const { id, ...rest } = post;
    return (batch: WriteBatch) =>
      batch.set(
        db.collection(COLLECTIONS.BLOG).doc(id),
        { ...rest, publishedAt: now, updatedAt: now },
        { merge: true },
      );
  });
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
  await db
    .collection(COLLECTIONS.SITE_CONFIG)
    .doc(_docId)
    .set(rest, { merge: true });
}

async function seedLoyaltyConfig(db: FirebaseFirestore.Firestore) {
  const { _docId, ...rest } = SEED_LOYALTY_CONFIG;
  await db
    .collection(COLLECTIONS.LOYALTY_CONFIG)
    .doc(_docId)
    .set(rest, { merge: true });
}

// ─── Dispatch table ─────────────────────────────────────────────────────────

type SeedFn = (db: FirebaseFirestore.Firestore) => Promise<void>;

const SEED_FNS: Record<string, SeedFn> = {
  products: seedProducts,
  collections: seedCollections,
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
};

const DELETE_FNS: Record<string, SeedFn> = {
  products: deleteProducts,
  collections: deleteCollections,
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

// ─── Route handlers ────────────────────────────────────────────────────────────

export async function GET() {
  if (!IS_DEV) return devOnly();
  return NextResponse.json({
    entities: Object.keys(SEED_FNS),
    deleteSupported: Object.keys(DELETE_FNS),
  });
}

export async function POST(req: NextRequest) {
  if (!IS_DEV) return devOnly();

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

  // Run all known entity operations in parallel
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

  // Bust Next.js ISR caches so storefront reflects the new data immediately
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path, "layout");
  }

  const hasErrors = Object.values(results).some((v) => v !== "ok");
  return NextResponse.json(
    { action, results, revalidated: REVALIDATE_PATHS },
    { status: hasErrors ? 207 : 200 },
  );
}
