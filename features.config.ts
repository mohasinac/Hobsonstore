/**
 * features.config.ts — Hobson Collectibles
 *
 * Enables / disables @mohasinac/feat-* packages for this project.
 * The CLI reads this file when running `@mohasinac/cli add <name>` or
 * `@mohasinac/cli remove <name>`.
 *
 * withFeatures() in next.config.ts reads this to populate transpilePackages.
 * mergeFeatureMessages() in i18n/request.ts reads this to merge i18n fragments.
 */

import type { FeaturesConfig } from "@mohasinac/contracts";

export default {
  // ── Shell (always on) ────────────────────────────────────────────────────
  layout: true,
  forms: true,
  filters: true,
  media: true,

  // ── Shared domain (Tier B) ───────────────────────────────────────────────
  auth: true,
  account: true,
  products: true,
  categories: true,
  cart: true,
  wishlist: true,
  checkout: true,
  orders: true,
  payments: true,
  blog: true,
  reviews: true,
  faq: true,
  search: true,
  homepage: true,
  admin: true,

  // ── Hobson-specific (Tier C) ─────────────────────────────────────────────
  loyalty: true,
  collections: true,
  preorders: true,
  whatsappBot: true,
} satisfies FeaturesConfig;
