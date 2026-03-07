/**
 * seed-loyalty.ts
 *
 * Populates Firestore with:
 *   - loyaltyConfig/main   — FCC Coins program settings
 *   - discounts/{code}     — Sample promo codes
 *
 * Usage (against local emulator):
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 ts-node -r tsconfig-paths/register scripts/seed-loyalty.ts
 *
 * Usage (against production — use with care):
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json ts-node -r tsconfig-paths/register scripts/seed-loyalty.ts
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

if (!getApps().length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp({ credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS) });
  } else {
    // Emulator – no credentials needed
    initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? "hobson-dev" });
  }
}

const db = getFirestore();

// ── Loyalty config ────────────────────────────────────────────────────────────

const loyaltyConfig = {
  /** 1 coin earned per ₹100 spent (= 0.01 coins per rupee) */
  coinsPerRupee: 0.01,
  /** 1 coin = ₹1 on redemption */
  rupeePerCoin: 1,
  /** Minimum coins needed before redemption is allowed */
  minCoinsToRedeem: 100,
  /** Maximum % of order total that can be paid with coins */
  maxRedeemPercent: 20,
  active: true,
};

// ── Sample discount codes ──────────────────────────────────────────────────────

const discounts = [
  {
    code: "WELCOME10",
    type: "percent" as const,
    value: 10,
    minOrderValue: 999,
    maxUses: 500,
    usedCount: 0,
    active: true,
    expiresAt: Timestamp.fromDate(new Date("2026-12-31T23:59:59Z")),
  },
  {
    code: "FLAT500",
    type: "flat" as const,
    value: 500,
    minOrderValue: 3000,
    maxUses: 100,
    usedCount: 0,
    active: true,
    expiresAt: Timestamp.fromDate(new Date("2026-09-30T23:59:59Z")),
  },
  {
    code: "NEWSTORE15",
    type: "percent" as const,
    value: 15,
    minOrderValue: 2000,
    maxUses: 200,
    usedCount: 0,
    active: true,
    expiresAt: Timestamp.fromDate(new Date("2026-06-30T23:59:59Z")),
  },
  {
    code: "TESTEXPIRED",
    type: "flat" as const,
    value: 200,
    minOrderValue: 0,
    maxUses: undefined,
    usedCount: 0,
    active: true,
    expiresAt: Timestamp.fromDate(new Date("2025-01-01T00:00:00Z")), // already expired
  },
];

async function seed() {
  console.log("Seeding loyaltyConfig/main …");
  await db
    .collection("loyaltyConfig")
    .doc("main")
    .set(loyaltyConfig, { merge: true });
  console.log("  ✓ loyaltyConfig/main written");

  console.log("\nSeeding discount codes …");
  for (const d of discounts) {
    const { code, ...rest } = d;
    await db
      .collection("discounts")
      .doc(code)
      .set({ code, ...rest }, { merge: true });
    console.log(`  ✓ discounts/${code}`);
  }

  console.log("\n✅ Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
