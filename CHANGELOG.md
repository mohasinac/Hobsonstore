# Changelog

All notable changes to **Hobson Collectibles** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

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

### Security

- Integration secrets (Twilio Auth Token, WhatsApp Webhook Secret, Razorpay keys) are stored AES-256-GCM encrypted in Firestore. Without the `ENCRYPTION_KEY` env var the secrets are stored as plaintext with a console warning — set this before production use.
- The admin `integration-keys` GET endpoint never returns raw encrypted values — only masked display strings and `IsSet` booleans.
- Admin API routes verify Firebase ID token and check `role === "admin"` in Firestore before proceeding.

---
