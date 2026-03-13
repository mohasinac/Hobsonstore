/**
 * /api/admin/seed
 *
 * Public dev/testing route for seeding Firestore.
 * GET  — returns live Firestore doc counts per entity collection.
 * POST — { action: "seed" | "delete", entities: string[] }
 *        Upserts or deletes seed data via Admin SDK, then revalidates ISR caches.
 * PATCH — { entityKey: string, id: string, patch: Record<string, unknown> }
 *         Updates a single document by ID with the given patch.
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminApp, getAdminDb } from "@/lib/firebase/admin";
import {
  SEED_PRODUCTS,
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
  SEED_CHARACTER_HOTSPOT,
  SEED_ADMIN_USER,
} from "@/scripts/seed-data";
import { COLLECTIONS } from "@/constants/firebase";

export const dynamic = "force-dynamic";

// Seed routes are blocked in production; only callable when SEED_SECRET is set.
function authorizeSeedRequest(req: import("next/server").NextRequest): boolean {
  const secret = process.env.SEED_SECRET;
  if (!secret) return false; // fail closed — must explicitly enable
  const auth = req.headers.get("Authorization");
  return auth === `Bearer ${secret}`;
}

// Paths to revalidate after any write
const REVALIDATE_PATHS = ["/", "/blog", "/collections", "/search", "/products"];

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Auth helper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬


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

// ─── Admin user seed/delete ─────────────────────────────────────────────────

async function seedAdminUser(db: FirebaseFirestore.Firestore) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAuth } = require("firebase-admin/auth");
  const auth = getAuth(getAdminApp());

  let uid = SEED_ADMIN_USER.uid;

  try {
    // User with our fixed UID already exists — just refresh credentials
    await auth.getUser(SEED_ADMIN_USER.uid);
    await auth.updateUser(uid, {
      email: SEED_ADMIN_USER.email,
      password: SEED_ADMIN_USER.password,
      displayName: SEED_ADMIN_USER.displayName,
      emailVerified: true,
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "auth/user-not-found") {
      try {
        await auth.createUser({
          uid: SEED_ADMIN_USER.uid,
          email: SEED_ADMIN_USER.email,
          password: SEED_ADMIN_USER.password,
          displayName: SEED_ADMIN_USER.displayName,
          emailVerified: true,
        });
      } catch (createErr: unknown) {
        // Email already taken by a different uid — update that user instead
        if ((createErr as { code?: string }).code === "auth/email-already-exists") {
          const existing = await auth.getUserByEmail(SEED_ADMIN_USER.email);
          uid = (existing as { uid: string }).uid;
          await auth.updateUser(uid, {
            password: SEED_ADMIN_USER.password,
            displayName: SEED_ADMIN_USER.displayName,
            emailVerified: true,
          });
        } else {
          throw createErr;
        }
      }
    } else {
      throw err;
    }
  }

  await db.collection(COLLECTIONS.USERS).doc(uid).set(
    {
      uid,
      email: SEED_ADMIN_USER.email,
      displayName: SEED_ADMIN_USER.displayName,
      role: SEED_ADMIN_USER.role,
      hcCoins: 0,
      addresses: [],
      wishlist: [],
      createdAt: serverTs(),
      updatedAt: serverTs(),
    },
    { merge: true },
  );
}

async function deleteAdminUser(db: FirebaseFirestore.Firestore) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAuth } = require("firebase-admin/auth");
  const auth = getAuth(getAdminApp());
  try {
    await auth.deleteUser(SEED_ADMIN_USER.uid);
  } catch (err: unknown) {
    if ((err as { code?: string }).code !== "auth/user-not-found") throw err;
  }
  await db.collection(COLLECTIONS.USERS).doc(SEED_ADMIN_USER.uid).delete();
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

async function seedCharacterHotspot(db: FirebaseFirestore.Firestore) {
  const { _docId, ...rest } = SEED_CHARACTER_HOTSPOT;
  await db.collection(COLLECTIONS.CHARACTER_HOTSPOT).doc(_docId).set(rest, { merge: true });
}

async function deleteCharacterHotspot(db: FirebaseFirestore.Firestore) {
  await db.collection(COLLECTIONS.CHARACTER_HOTSPOT).doc("main").delete();
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Dispatch tables Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

type SeedFn = (db: FirebaseFirestore.Firestore) => Promise<void>;

const SEED_FNS: Record<string, SeedFn> = {
  adminUser: seedAdminUser,
  products: seedProducts,
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
  characterHotspot: seedCharacterHotspot,
};

const DELETE_FNS: Record<string, SeedFn> = {
  adminUser: deleteAdminUser,
  products: deleteProducts,
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
  characterHotspot: deleteCharacterHotspot,
};

// Collection names per entity key (for live count queries)
const ENTITY_COLLECTION: Record<string, string> = {
  products: COLLECTIONS.PRODUCTS,
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
  characterHotspot: COLLECTIONS.CHARACTER_HOTSPOT,
};

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Route handlers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export async function GET(req: NextRequest) {
  if (!authorizeSeedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getAdminDb();
  const entityKeys = Object.keys(SEED_FNS);

  const counts = await Promise.all(
    entityKeys.map(async (key) => {
      if (key === "adminUser") {
        try {
          const doc = await db.collection(COLLECTIONS.USERS).doc(SEED_ADMIN_USER.uid).get();
          return doc.exists ? 1 : 0;
        } catch {
          return -1;
        }
      }
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
  if (!authorizeSeedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

export async function PATCH(req: NextRequest) {
  if (!authorizeSeedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { entityKey: string; id: string; patch: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { entityKey, id, patch } = body ?? {};
  if (!entityKey || !id || typeof patch !== "object" || patch === null) {
    return NextResponse.json(
      { error: "entityKey, id, and patch (object) are required" },
      { status: 400 },
    );
  }

  const col = ENTITY_COLLECTION[entityKey];
  if (!col) {
    return NextResponse.json(
      { error: `Unknown entityKey: '${entityKey}'` },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  await db.collection(col).doc(id).set(patch, { merge: true });

  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path, "layout");
  }

  return NextResponse.json({ ok: true, entityKey, id });
}