/**
 * scripts/migrate-collections.ts
 *
 * One-off migration: splits old `collections` docs (with type=franchise or type=brand)
 * into dedicated `franchises` and `brands` Firestore collections.
 *
 * Run once:
 *   npx ts-node --project tsconfig.json scripts/migrate-collections.ts
 *
 * Prerequisites:
 *   - GOOGLE_APPLICATION_CREDENTIALS pointing at firebase-admin-key.json
 *     OR set FIREBASE_SERVICE_ACCOUNT env var with the JSON path
 *   - The project's Firebase project ID in NEXT_PUBLIC_FIREBASE_PROJECT_ID
 */

import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

// Initialise Admin SDK
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT
  ?? path.join(__dirname, "../hobsoncollectible-firebase-adminsdk-fbsvc-9092e20218.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(fs.readFileSync(keyPath, "utf-8"))
    ),
  });
}

const db = admin.firestore();

async function migrate() {
  const collectionsSnap = await db.collection("collections").get();
  if (collectionsSnap.empty) {
    console.log("No docs in collections — nothing to migrate.");
    return;
  }

  let franchiseCount = 0;
  let brandCount = 0;
  let curatedCount = 0;

  const batch = db.batch();

  for (const doc of collectionsSnap.docs) {
    const data = doc.data();

    if (data.type === "franchise") {
      const target = db.collection("franchises").doc(doc.id);
      batch.set(target, {
        name: data.name,
        slug: doc.id,
        thumbnailImage: data.logoImage ?? data.bannerImage ?? null,
        bannerImage: data.bannerImage ?? null,
        description: data.description ?? null,
        sortOrder: data.sortOrder ?? 0,
        active: data.active ?? true,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
      }, { merge: true });
      franchiseCount++;
    } else if (data.type === "brand") {
      const target = db.collection("brands").doc(doc.id);
      batch.set(target, {
        name: data.name,
        slug: doc.id,
        logoImage: data.logoImage ?? null,
        bannerImage: data.bannerImage ?? null,
        description: data.description ?? null,
        sortOrder: data.sortOrder ?? 0,
        active: data.active ?? true,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
      }, { merge: true });
      brandCount++;
    } else {
      // Curated collection — keep as-is (already correct shape)
      curatedCount++;
    }
  }

  await batch.commit();

  console.log(`Migration complete:`);
  console.log(`  → ${franchiseCount} franchise docs written to /franchises`);
  console.log(`  → ${brandCount} brand docs written to /brands`);
  console.log(`  → ${curatedCount} curated collections left untouched in /collections`);
  console.log(`\nManually delete the migrated docs from /collections after verifying.`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
