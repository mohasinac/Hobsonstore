# Changelog

All notable changes to **Hobson Collectibles** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [0.2.0] — 2026-03-14

### Added

#### Integration Keys — DB-Stored Encrypted Credentials

- `lib/encryption.ts` — server-only AES-256-GCM encrypt/decrypt utility. Requires `ENCRYPTION_KEY` env var (64 hex chars). Falls back gracefully with a warning if unset. Includes `maskKey()` helper for safe UI display and `isEncrypted()` predicate.
- `lib/integration-keys.ts` — server-only resolver that reads Twilio, WhatsApp, and Razorpay keys from Firestore `settings/integrationKeys` (decrypted), falling back to existing environment variables. Results are process-cached for 60 s; call `invalidateIntegrationKeysCache()` after admin writes.
- `types/config.ts` — added `IntegrationKeys` interface (Firestore document shape for `settings/integrationKeys`).
- `lib/firebase/server.ts` — added `getIntegrationKeysServer()` and `updateIntegrationKeysServer()` data-access functions.
- `app/api/admin/settings/integration-keys/route.ts` — new admin API: `GET` returns masked values (`••••••` for secrets, `IsSet` booleans); `PATCH` encrypts secrets and saves to Firestore; `DELETE ?field=<name>` removes a single field. All endpoints require admin role.
- `app/[locale]/(admin)/admin/config/integrations/page.tsx` — new admin settings page with sections for Twilio WhatsApp credentials, WhatsApp business numbers, Razorpay (Phase 8), and admin notification emails. Secret inputs show/hide toggle; "Saved" badges on already-configured keys.
- `constants/firebase.ts` — added `INTEGRATION_KEYS: "integrationKeys"` collection constant.
- `constants/routes.ts` — added `ADMIN_SETTINGS_INTEGRATIONS: "/admin/config/integrations"` route constant.
- `components/admin/AdminSidebar.tsx` — added **Integrations** link (🔑 icon) under Config group.

#### Search Dialog

- `components/layout/SearchDialog.tsx` — spotlight-style search dialog triggered by `Cmd+K` / `Ctrl+K` or the navbar search button; debounced API calls with 280 ms delay; product/franchise/brand results with images; site quick-links; empty state; and a "see all results" link. Uses hobson's comic design language.
- `app/api/search/route.ts` — new `GET /api/search?q=` endpoint; searches active products (name, franchise, brand, tags, description), franchises, and brands; returns top 5 results per category.
- `components/layout/Navbar.tsx` — replaced static `/search` link with `SearchDialog` component (Cmd+K badge visible on xl screens).
- `components/layout/MobileMenu.tsx` — added inline search form with client-side routing on submit.

#### Admin Content Management

- `app/[locale]/(admin)/admin/content/promo-banners/page.tsx` — new admin page to manage promotional banner slots.
- `app/[locale]/(admin)/admin/content/trust-badges/page.tsx` — new admin page to manage trust badges shown on storefront.
- `app/[locale]/(admin)/admin/content/character-hotspot/page.tsx` — new admin page for the interactive character-hotspot home section.
- `components/admin/PromoBannerForm.tsx` — form component for creating/editing promo banners.
- `components/admin/TrustBadgeForm.tsx` — form component for creating/editing trust badges.
- `components/admin/CharacterHotspotForm.tsx` — rich form for configuring hotspot image, characters, and click-through links.

#### Home Section & UI Components

- `components/home/CharacterHotspot.tsx` — interactive hotspot component; clickable character pins overlaid on a hero image, driving to product/franchise pages.
- `components/home/TrustBadges.tsx` — trust badge strip rendered on the storefront home page.
- `components/layout/SiteHeader.tsx` — extracted sticky site header component used across storefront layouts.
- `components/layout/MainContent.tsx` — shared main content wrapper for storefront layout.
- `components/ui/BackToTop.tsx` — accessible back-to-top floating button.
- `components/ui/ThemeToggle.tsx` — light/dark mode toggle button wired to next-themes.
- `lib/firebase/content.ts` — data-access helpers for content documents (banners, trust badges, hotspots).
- `types/content.ts` — TypeScript interfaces for all CMS content types.

#### Storefront & SEO

- `app/[locale]/(storefront)/search/page.tsx` (Shop All) — full overhaul: filter sidebar with franchise/brand/price filters, skeleton loading, empty state shown until at least one filter is applied.
- `app/not-found.tsx` — branded 404 page with Hobson comic styling and navigation links.
- `scripts/seed-data.ts` — expanded seed script; seed page moved to `app/[locale]/(storefront)/seed/page.tsx` (locale-aware).

### Changed

- **Global CSS** (`app/globals.css`) — major theming pass: CSS custom properties for brand colours, dark-mode palette, comic-style shadows, and animation utilities.
- **`constants/theme.ts`** — extended with full design token set for use across components.
- **`i18n/routing.ts`** — added Hindi (`hi`) locale alongside English; middleware updated to match.
- All storefront page components updated to accept the `locale` param and pass it to locale-aware navigation/link helpers.
- `components/layout/Navbar.tsx` — redesigned with sticky behaviour, improved mobile breakpoints, and SearchDialog integration.
- `components/layout/AnnouncementBar.tsx` — now reads content from Firestore via `lib/firebase/content.ts`.
- `components/layout/Footer.tsx` — updated links and social icons.
- `components/home/HeroBanner.tsx`, `FranchiseStrip.tsx`, `BrandStrip.tsx`, `PromoGrid.tsx`, `TestimonialsCarousel.tsx` — restyled with updated brand tokens and responsive layouts.
- `app/api/admin/seed/route.ts` — seeding logic extended to cover new content types.

### Fixed

- `types/order.ts` — added missing `coinsDiscount` field to `Order` interface (written by checkout route but previously untyped).
- `lib/firebase/server.ts` — fixed Firestore path for `integrationKeys` to use `COLLECTIONS.INTEGRATION_KEYS + doc('main')` instead of hardcoded strings; wrapped all cached product queries with `unstable_cache` for ISR compatibility.
- `app/api/admin/settings/integration-keys/route.ts` — DELETE handler now uses the corrected Firestore path.
- `app/api/search/route.ts` — wrapped `Promise.all` in try/catch; returns HTTP 500 instead of an unhandled rejection on server errors.
- `components/layout/SearchDialog.tsx` — use locale-aware `useRouter` from `@/i18n/navigation` so search submissions preserve the active locale prefix (e.g. `/hi/`).
- `components/home/CharacterHotspot.tsx` — added missing `xPct` to fallback `HOTSPOTS` entries, preventing layout errors on first render.
- `app/api/revalidate/route.ts` — tag-based cache invalidation now correctly purges `unstable_cache` entries on product/content writes.

### Performance

- `lib/firebase/server.ts` — all heavy product-listing queries wrapped with `unstable_cache`; 60 s TTL with per-tag revalidation to eliminate redundant Firestore reads per request.
- `app/[locale]/(storefront)/search/page.tsx` — `export const revalidate = 60` added so the Shop All page is statically revalidated rather than rendered on every request.

### Security

- Integration secrets (Twilio Auth Token, WhatsApp Webhook Secret, Razorpay keys) are stored AES-256-GCM encrypted in Firestore. Without the `ENCRYPTION_KEY` env var the secrets are stored as plaintext with a console warning — set this before production use.
- The admin `integration-keys` GET endpoint never returns raw encrypted values — only masked display strings and `IsSet` booleans.
- `firestore.rules` — added explicit `allow read` rules for `franchises` and `brands` collections (public storefront access) and `deny all` for `integrationKeys` (server-only via Admin SDK).
- Admin API routes verify Firebase ID token and check `role === "admin"` in Firestore before proceeding.

---
