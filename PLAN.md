# FatCat Collectibles — Full Platform Plan

> **Stack:** Next.js 15 (App Router) · Firebase (Firestore, Auth, Storage, Functions) · WhatsApp (checkout + inventory bot) · Zustand · Tailwind CSS
> **Payment (Phase 1):** WhatsApp-message-based · **Payment (Phase 2, future):** Razorpay drop-in

---

## Table of Contents

0. [Development Setup](#0-development-setup)
   - 0.1 [Prerequisites](#01-prerequisites)
   - 0.2 [Environment Variables](#02-environment-variables)
   - 0.3 [Local Development Commands](#03-local-development-commands)
   - 0.4 [Git Workflow & Branch Strategy](#04-git-workflow--branch-strategy)
   - 0.5 [Coding Standards](#05-coding-standards)
   - 0.6 [Testing Strategy](#06-testing-strategy)
1. [Site Overview](#1-site-overview)
2. [As-Crawled Site Map](#2-as-crawled-site-map)
   - 2.1 [All Pages & URLs](#21-all-pages--urls)
   - 2.2 [Navigation Structure](#22-navigation-structure)
   - 2.3 [All Collections Discovered](#23-all-collections-discovered)
   - 2.4 [Footer Structure](#24-footer-structure)
3. [Dynamic Content Map](#3-dynamic-content-map)
4. [System Architecture](#4-system-architecture)
5. [Folder Structure](#5-folder-structure)
   - 5.1 [Root Layout](#root-layout)
   - 5.2 [app/ — Next.js App Router](#app--nextjs-app-router)
   - 5.3 [components/ — UI Component Library](#components--ui-component-library)
   - 5.4 [constants/ — Single Source of Truth](#constants--single-source-of-truth)
   - 5.5 [lib/ — Business Logic & Data Layer](#lib--business-logic--data-layer)
   - 5.6 [hooks/ — React Hooks](#hooks--react-hooks)
   - 5.7 [store/ — Zustand Stores](#store--zustand-stores)
   - 5.8 [types/ — TypeScript Type Definitions](#types--typescript-type-definitions)
   - 5.9 [functions/ — Firebase Cloud Functions](#functions--firebase-cloud-functions)
   - 5.10 [scripts/ — Developer Utilities](#scripts--developer-utilities)
6. [Firestore Schema](#6-firestore-schema)
7. [Constants & DRY Design](#7-constants--dry-design)
8. [Feature Breakdown](#8-feature-breakdown)
   - 8.1 [Product Catalog](#81-product-catalog)
   - 8.2 [Cart & WhatsApp Checkout](#82-cart--whatsapp-checkout)
   - 8.3 [Order Tracking](#83-order-tracking)
   - 8.4 [Inventory Management via WhatsApp](#84-inventory-management-via-whatsapp)
   - 8.5 [Loyalty — FCC Coins](#85-loyalty--fcc-coins)
   - 8.6 [Pre-orders](#86-pre-orders)
   - 8.7 [Admin Panel](#87-admin-panel)
   - 8.8 [Blog & Content Pages](#88-blog--content-pages)
9. [API Routes](#9-api-routes)
10. [Cloud Functions](#10-cloud-functions)
11. [Security Design](#11-security-design)
12. [Phased Implementation Plan](#12-phased-implementation-plan)
    - 12.1 [Phase 1 — Foundation](#121-phase-1--foundation)
    - 12.2 [Phase 2 — Core UX](#122-phase-2--core-ux)
    - 12.3 [Phase 3 — Order Tracking](#123-phase-3--order-tracking)
    - 12.4 [Phase 4 — Inventory via WhatsApp](#124-phase-4--inventory-via-whatsapp)
    - 12.5 [Phase 5 — Content & SEO](#125-phase-5--content--seo)
    - 12.6 [Phase 6 — Admin Panel](#126-phase-6--admin-panel)
    - 12.7 [Phase 7 — Loyalty & Pre-orders](#127-phase-7--loyalty--pre-orders)
13. [Future Upgrades](#13-future-upgrades)

---

## 0. Development Setup

### 0.1 Prerequisites

| Tool         | Version  | Install                            |
| ------------ | -------- | ---------------------------------- |
| Node.js      | ≥ 20 LTS | [nodejs.org](https://nodejs.org)   |
| pnpm         | ≥ 9      | `npm i -g pnpm`                    |
| Firebase CLI | ≥ 13     | `npm i -g firebase-tools`          |
| Git          | ≥ 2.40   | [git-scm.com](https://git-scm.com) |

**Recommended VS Code extensions:** ESLint · Prettier · Tailwind CSS IntelliSense · Firebase Explorer

---

### 0.2 Environment Variables

Create `.env.local` at repo root (never commit — `.gitignore`'d). Copy from `.env.example`.

```bash
# ─── Firebase Client (public — safe in browser) ───────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ─── Firebase Admin SDK (server-only — NEVER expose client-side) ──────────────
FIREBASE_SERVICE_ACCOUNT_JSON=          # full JSON string of service account key

# ─── WhatsApp / Messaging ──────────────────────────────────────────────────────
WHATSAPP_WEBHOOK_SECRET=                # HMAC secret for inbound webhook verification
WHATSAPP_API_TOKEN=                     # Twilio/Wati API bearer token (if using send API)

# ─── App ──────────────────────────────────────────────────────────────────────
NEXTAUTH_SECRET=                        # Random 32-char string (openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000      # Override in production with real URL
REVALIDATE_SECRET=                      # Token for /api/revalidate endpoint
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> All variables prefixed `NEXT_PUBLIC_` are bundled into the client. Everything else is server-only.

---

### 0.3 Local Development Commands

```bash
# Install dependencies (all workspaces)
pnpm install

# Start dev server (Next.js)
pnpm dev                    # http://localhost:3000

# Start Firebase emulators (Auth, Firestore, Functions, Storage)
pnpm emulators              # alias for: firebase emulators:start

# Type-check
pnpm typecheck              # tsc --noEmit

# Lint
pnpm lint                   # eslint .

# Format
pnpm format                 # prettier --write .

# Build (production)
pnpm build

# Seed Firestore emulator with sample data
pnpm seed                   # ts-node scripts/seed-firestore.ts

# Deploy to Firebase Hosting + Functions
pnpm deploy                 # firebase deploy
```

`package.json` scripts section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "emulators": "firebase emulators:start --import=./emulator-data --export-on-exit",
    "seed": "tsx scripts/seed-firestore.ts",
    "deploy": "firebase deploy"
  }
}
```

---

### 0.4 Git Workflow & Branch Strategy

```
main          ← production-ready; protected; CI must pass before merge
  └─ dev      ← integration branch; all phase branches merge here first
       ├─ phase/1-foundation
       ├─ phase/2-core-ux
       ├─ phase/3-order-tracking
       ├─ phase/4-inventory-bot
       ├─ phase/5-content-seo
       ├─ phase/6-admin
       └─ phase/7-loyalty
```

**Commit convention (Conventional Commits):**

```
feat(cart): add qty stepper with min/max guard
fix(checkout): prevent double-submit on slow network
chore(deps): bump firebase to 11.x
refactor(products): extract PriceTag into standalone component
docs(plan): update phase 2 checklist
```

**Per-phase gate:** Before merging a phase branch → `dev`:

1. `pnpm typecheck` passes with zero errors
2. `pnpm lint` passes with zero errors
3. `pnpm build` succeeds
4. Manual smoke-test of all new pages/flows

---

### 0.5 Coding Standards

| Area           | Rule                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Language       | TypeScript strict mode. `any` is forbidden; use `unknown` + type guards                                                            |
| Imports        | Absolute paths via `@/` alias (`@/components`, `@/lib`, `@/types`, etc.)                                                           |
| Components     | Server Components by default; add `"use client"` only when needed                                                                  |
| State          | Zustand for cart/wishlist. No prop-drilling beyond 2 levels — use context or store                                                 |
| Data fetching  | Server Components fetch Firestore directly. Client components use `onSnapshot` only for real-time needs                            |
| Styling        | Tailwind utility classes only. No inline `style={}` except for dynamic values not expressible in Tailwind                          |
| File naming    | `PascalCase.tsx` for components, `camelCase.ts` for non-component modules                                                          |
| Constants      | All magic strings/numbers in `constants/`. Never hardcode Firestore collection names in page files                                 |
| Security       | Sanitise all rich text with DOMPurify server-side. Never trust client-provided userId for writes — always read from server session |
| Error handling | Use `try/catch` with typed errors at API route and Cloud Function boundaries only                                                  |

---

### 0.6 Testing Strategy

| Layer       | Tool                           | Scope                                                                                    |
| ----------- | ------------------------------ | ---------------------------------------------------------------------------------------- |
| Unit        | Vitest                         | `lib/` utilities (formatCurrency, loyalty calc, whatsapp builders, discount validation)  |
| Component   | Vitest + React Testing Library | UI primitives (Button, Input, PriceTag, StockBadge)                                      |
| Integration | Vitest + Firestore emulator    | API routes (`/api/checkout`, `/api/webhooks/whatsapp`)                                   |
| E2E         | Playwright                     | Critical flows: browse → add to cart → checkout → WA redirect; admin order status update |

Test files co-located: `lib/formatCurrency.test.ts`, `components/ui/Button.test.tsx`.  
Run all: `pnpm test`. Run watch: `pnpm test --watch`.

---

---

## 1. Site Overview

FatCat Collectibles is a premium collectibles e-commerce store operating in India with two physical outlets (Pune, Bengaluru). The platform sells licensed action figures, statues, and pop-culture collectibles across 20+ franchise categories and 20+ brand collections, ranging from ₹1,699 to ₹1,78,999+.

### Business Characteristics

| Property           | Value                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Currency           | INR (₹)                                                                                        |
| Primary categories | Franchise (TMNT, Marvel, DC, Star Wars, etc.) + Brand (Hot Toys, Sideshow, Iron Studios, etc.) |
| Order type         | In-stock + Pre-order                                                                           |
| Payment (Phase 1)  | WhatsApp message → owner manual confirmation                                                   |
| Payment (Phase 2)  | Razorpay (no-cost EMI above ₹6,000)                                                            |
| Loyalty            | FCC Coins — earn on purchase, redeem on next order                                             |
| Shipping           | Free pan-India                                                                                 |
| Support            | WhatsApp + Phone, Mon–Fri 11am–8pm IST                                                         |
| Admin contacts     | Customer Care: +91 7620783819 · Statues: +91 7887888187                                        |

---

## 2. As-Crawled Site Map

Every page below was directly crawled from `fatcatcollectibles.in`. Our build replicates each one 1:1 using the Next.js route and content elements listed.

---

### 2.1 All Pages & URLs

#### `/` — Homepage

**Next.js route:** `app/(storefront)/page.tsx`

| Section                    | Real Content                                                                                                                                                                             | Implementation                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Announcement bar           | Rotating 2 messages: "NO COST EMI ON ORDERS ABOVE ₹6000" + "FATCAT Bengaluru Store Now Open!"                                                                                            | `AnnouncementBar` ← Firestore `announcements`                |
| Hero carousel              | 4–5 slides (images + CTAs — Browse INART Collection, etc.)                                                                                                                               | `HeroBanner` ← Firestore `banners`                           |
| Franchise collection strip | TMNT, DC Comics, Marvel, Transformers, G.I. Joe, Star Wars, MOTU, One Piece, Demon Slayer, Naruto, DBZ, Attack on Titan, JJK, + more                                                     | `CollectionStrip` ← Firestore `collections` (type=franchise) |
| Brand logo strip           | Prime 1 Studios, Sideshow, Iron Studios, McFarlane, First 4 Figures, Super7, Funko, Threezero, NECA, Mezco, Diamond, Storm, Tsume, Infinity Studios, Kotobukiya, Hot Toys, INART, + more | `BrandStrip` ← Firestore `collections` (type=brand)          |
| Featured collection row    | "Featured collection" title + horizontal product carousel with "View all" link                                                                                                           | `HomeSection` ← Firestore `homeSections` (type=featured)     |
| Bestsellers row            | "POPULARS — CHECK THE BESTSELLERS" + product carousel                                                                                                                                    | `HomeSection` ← Firestore `homeSections` (type=bestseller)   |
| Mid-page promo banners     | 4 inline banners: Tintin, Harry Potter, Puzzles, Black Panther (each with "Buy Now"/"Explore" CTA)                                                                                       | `PromoGrid` ← Firestore `promobanners`                       |
| Testimonials carousel      | 20+ customer testimonials with name + star rating + text. Scrollable.                                                                                                                    | `TestimonialsCarousel` ← Firestore `testimonials`            |
| FAQ accordion              | 4 questions (shipping time, shipping cost, international shipping, discount code help)                                                                                                   | `FAQAccordion` ← Firestore `faq`                             |
| Trust badge row            | Free Shipping · Customer Service · Earn FCC Coins · Secure Payment (RazorPay badge)                                                                                                      | `TrustBadges` ← Firestore `siteConfig.trustBadges[]`         |
| Newsletter signup          | "Join our VIP list!" email input + Subscribe                                                                                                                                             | `NewsletterSignup`                                           |
| Footer                     | See §2.4                                                                                                                                                                                 | `Footer`                                                     |

---

#### `/collections` — All Collections Index

**Next.js route:** `app/(storefront)/collections/page.tsx`  
**Render:** ISR, revalidate 300s

Content: Full alphabetical grid of every collection tile (both franchise + brand). Paginated (`?page=2`).  
Each tile is a link card with collection name → `/collections/[slug]`.

All collection slugs discovered:
`1-6-scale`, `action-figures`, `aliens-predators`, `animation-1`, `anime-japanese`, `aquarius-entertainment`, `assassins-creed`, `attack-on-titans`, `bandai-namco`, `bandai-tamashii`, `banpresto`, `batman`, `black-panther`, `dc-comics`, `demon-slayer`, `dragon-ball-z`, `first-4-figures`, `funko`, `g-i-joe`, `harry-potter`, `hot-toys`, `inart`, `infinity-studios`, `iron-studios`, `jujutsu-kaisen`, `kotobukiya`, `marvel`, `masters-of-the-universe`, `mcfarlane-toys`, `mezco-toys`, `naruto`, `neca`, `one-piece`, `prime-1-studios`, `puzzles`, `queen-studios`, `sideshow`, `star-wars`, `storm-collectibles`, `super7`, `the-adventures-of-tintin`, `threezero-1`, `tmnt`, `transformers`, `tsume-art`, `vendors` (brand listing), `warhammer-40000`, `whats-new`, `wwe`, + more via page 2.

---

#### `/collections/[slug]` — Collection Listing Page

**Next.js route:** `app/(storefront)/collections/[slug]/page.tsx`  
**Render:** ISR, revalidate 300s

| Element                 | Content                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Collection banner image | Full-width header image (e.g., Marvel banner, DC banner, Hot Toys banner)                                                                               |
| Collection title        | e.g., "MARVEL", "What's New", "HOT TOYS"                                                                                                                |
| Collection description  | e.g., "See what's new latest additions, upcoming releases…"                                                                                             |
| Product count           | "484 products", "756 products" etc.                                                                                                                     |
| Filter & Sort button    | Opens filter panel: Availability (In Stock / Sold Out), Price range, Brand, Sort by (Featured / Price asc / Price desc / A–Z / Z–A / Old–New / New–Old) |
| Product grid            | Responsive grid, 4 cols desktop → 2 cols mobile                                                                                                         |
| Product card            | Image (hover shows second image), sold-out overlay, sale badge, name, sale price + regular price strikethrough                                          |
| Pagination              | Previous / Next links (`?page=N`)                                                                                                                       |

---

#### `/products/[slug]` — Product Detail Page

**Next.js route:** `app/(storefront)/products/[slug]/page.tsx`  
**Render:** ISR, revalidate 300s

| Element               | Content                                                       | Detail                                                                                    |
| --------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Image gallery         | Up to 20 product images                                       | Thumbnail filmstrip left, main image right, zoom on click/hover, carousel navigation dots |
| Brand breadcrumb link | e.g., "HOT TOYS"                                              | Links to `/collections/hot-toys`                                                          |
| Product title         | Full product name                                             |                                                                                           |
| Price block           | Sale price (bold red) + Regular price (grey strikethrough)    | `PriceTag` component                                                                      |
| Description           | Rich text body                                                | ETA line for pre-orders (e.g., "ETA: Mar/Apr 2026")                                       |
| Quantity selector     | Stepper: `−` `1` `+`                                          | Min 1, max = available stock                                                              |
| Wishlist button       | "Add to Wishlist" text button                                 | Toggles Zustand wishlist                                                                  |
| Primary CTA           | "Pre-order" or "Add to Cart"                                  | Context-aware based on `isPreorder` + `inStock`                                           |
| Secondary CTA         | "Buy it now"                                                  | Bypasses cart, goes straight to checkout                                                  |
| Trust badges          | Free Shipping · Customer Service · FCC Coins · Secure Payment | Reuses homepage `TrustBadges` component                                                   |
| Sold-out state        | "Sold out" label, disabled Add to Cart                        | Driven by `inStock` / `availableStock`                                                    |

---

#### `/search` — Search Page

**Next.js route:** `app/(storefront)/search/page.tsx`  
**Render:** No cache (SSR per request)

| Element          | Content                                                                          |
| ---------------- | -------------------------------------------------------------------------------- |
| Search input     | Centered text input with search icon, `q` query param                            |
| Results grid     | Same `ProductGrid` + `ProductCard` as collection page when query returns results |
| No results state | "No products found for '[query]'" + link to browse all                           |

---

#### `/cart` — Cart Page

**Next.js route:** `app/(storefront)/cart/page.tsx`

| Element         | Content                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| Empty state     | "Your cart is empty" heading + "Continue shopping" link → `/collections/all`       |
| Populated state | Line items (image, name, price, qty stepper, remove), subtotal, "Check Out" button |
| Checkout entry  | Leads to `/checkout`                                                               |

---

#### `/checkout` — Checkout Page (Our Addition)

**Next.js route:** `app/(storefront)/checkout/page.tsx`  
_The original Shopify site uses Shopify Checkout. We replace this with our WhatsApp flow._

| Element          | Content                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Address form     | Name, Phone, Address line 1, Line 2, City, State, Pincode                                      |
| Saved addresses  | Picker if user is logged in                                                                    |
| FCC Coins toggle | "Use X coins (save ₹Y)"                                                                        |
| Discount code    | Input + Apply                                                                                  |
| Order summary    | Readonly cart items + subtotal, discount, coins, total                                         |
| CTA              | "Place Order via WhatsApp" → writes to Firestore, redirects to `wa.me` with pre-filled message |

---

#### `/orders/[orderId]/track` — Order Tracking (Our Addition)

**Next.js route:** `app/(storefront)/orders/[orderId]/track/page.tsx`  
_Not on original Shopify site — we add this for our custom order flow._

| Element              | Content                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| Status stepper       | Vertical timeline: each step = status name + timestamp from `statusHistory` |
| Current status badge | Colour-coded per `orderStatusConfig`                                        |
| Tracking info        | Courier name + tracking URL when shipped                                    |
| Real-time            | `onSnapshot` updates status without page refresh                            |

---

#### `/account/login` — Login / Register

**Next.js route:** `app/(auth)/login/page.tsx`  
_Original site redirects to Shopify/shop.app auth. We use Firebase Auth._

| Element         | Content                             |
| --------------- | ----------------------------------- |
| Sign in form    | Email + Password                    |
| Google sign-in  | "Continue with Google" OAuth button |
| Register link   | "Don't have an account? Register"   |
| Forgot password | Link to `/forgot-password`          |

---

#### `/account` — Account Dashboard

**Next.js route:** `app/(storefront)/account/page.tsx`

| Element           | Content                                |
| ----------------- | -------------------------------------- |
| Profile info      | Name, Email, Phone                     |
| FCC Coins balance | Current balance + "View history" link  |
| Quick links       | My Orders · My Wishlist · My Addresses |

---

#### `/account/orders` — Order History

**Next.js route:** `app/(storefront)/account/orders/page.tsx`

| Element     | Content                                                     |
| ----------- | ----------------------------------------------------------- |
| Order list  | Each row: Order ID, date, total, status badge, "Track" link |
| Empty state | "No orders yet. Start shopping!"                            |

---

#### `/account/orders/[orderId]` — Order Detail

**Next.js route:** `app/(storefront)/account/orders/[orderId]/page.tsx`

Line items, totals, delivery address, status history timeline.

---

#### `/account/wishlist` — Wishlist

**Next.js route:** `app/(storefront)/account/wishlist/page.tsx`  
_Original site uses `/apps/wishlist` Shopify app. We build natively._

Product grid of saved wishlist items (pulled from `users/{uid}.wishlist`). Each card has "Add to Cart" + "Remove" actions.

---

#### `/account/addresses` — Saved Addresses

**Next.js route:** `app/(storefront)/account/addresses/page.tsx`

| Element         | Content                                               |
| --------------- | ----------------------------------------------------- |
| Address cards   | Name, full address text, phone, Edit / Delete buttons |
| Add address     | "Add a new address" form                              |
| Default address | Radio to set default                                  |

---

#### `/blog` — Blog Index

**Next.js route:** `app/(storefront)/blog/page.tsx`  
**Render:** ISR, revalidate 3600s  
**Current state on live site:** "This blog is empty" — we build it ready to publish. Shows empty state until posts are added via admin.

---

#### `/blog/[slug]` — Blog Post

**Next.js route:** `app/(storefront)/blog/[slug]/page.tsx`  
**Render:** ISR, revalidate 3600s

Cover image, title, author, date, rich-text body.

---

#### `/about` — About Us

**Next.js route:** `app/(storefront)/[pageSlug]/page.tsx` (slug = `about`)  
**Firestore:** `pages/about`

Rich text body (company history since 2011, authorised distributor list: Sideshow, Iron Studios, Prime 1 Studio, XM Studios, Queen Studios, Hot Toys, Blitzway, Kotobukiya, Chronicle, Funko, DC Collectibles).

---

#### `/contact` — Contact Us

**Next.js route:** `app/(storefront)/[pageSlug]/page.tsx` (slug = `contact`)  
**Firestore:** `pages/contact`

| Element         | Content                                                           |
| --------------- | ----------------------------------------------------------------- |
| Page heading    | "Contact Us"                                                      |
| Section heading | "Do you have any question?"                                       |
| Contact form    | Name · Email · Message · "Send message" button (POST to Firebase) |
| Store info      | Pulled from `siteConfig.locations[]` + WA/phone numbers           |

---

#### `/policies/terms-of-service` — Terms of Service

**Next.js route:** `app/(storefront)/policies/[policy]/page.tsx`  
**Firestore:** `pages/terms-of-service`

20 sections (online store terms, general conditions, accuracy, modifications, products, billing, optional tools, third-party links, user comments, personal information, errors, prohibited uses, disclaimer, indemnification, severability, termination, entire agreement, governing law, changes, contact info). Rendered as sanitised rich text.

---

#### `/policies/privacy-policy` — Privacy Policy

**Next.js route:** `app/(storefront)/policies/[policy]/page.tsx`  
**Firestore:** `pages/privacy-policy`

4 sections: General Information · Information We Collect · Stock Availability · Pre-orders.

---

#### `/policies/shipping-policy` — Shipping Policy

**Next.js route:** `app/(storefront)/policies/[policy]/page.tsx`  
**Firestore:** `pages/shipping-policy`

9 numbered sections: Destinations (India) · Processing Time (4–5 days) · Carriers (DTDC, Bluedart, Tirupathi, Mark Express, Delhivery) · Costs (free above ₹999) · Express (2–3 days, customer bears cost) · Estimated Delivery · Order Tracking · International · Order Status & Support.

---

#### `/policies/refund-policy` — Refund Policy

**Next.js route:** `app/(storefront)/policies/[policy]/page.tsx`  
**Firestore:** `pages/refund-policy`

4 sections: Order Changes/Replacements (24hr window) · Refund & Cancellation (10% processing fee, NRD forfeited, premium brands 30–35% NRD) · Exclusive Product Orders · Replacement (manufacturing defect, video documentation required, sale items excluded).

---

### 2.2 Navigation Structure

```
[Announcement Bar — rotates 2 messages from Firestore `announcements`]

[FATCAT COLLECTIBLES logo]  [Collections ▾]  [Search 🔍]  [Account 👤]  [Wishlist ♡]  [Cart 🛒 (count)]

Collections mega-menu
├── Browse by Franchise
│   TMNT · DC Comics · Marvel · Transformers · G.I. Joe · Star Wars · MOTU · One Piece
│   Demon Slayer · Naruto · Dragon Ball Z · Attack on Titan · Jujutsu Kaisen · + more
└── Browse by Brand
    Prime 1 Studio · Sideshow · Iron Studios · McFarlane Toys · First 4 Figures · Super7
    Funko · Threezero · NECA · Mezco Toys · Diamond · Storm Collectibles · Tsume Art
    Infinity Studios · Kotobukiya · Hot Toys · INART · Queen Studios · + more
```

All nav items are driven by Firestore `collections` (sortOrder + active=true).

---

### 2.3 All Collections Discovered

#### Franchise Collections

| Slug                       | Display Name             |
| -------------------------- | ------------------------ |
| `tmnt`                     | TMNT                     |
| `dc-comics`                | DC Comics                |
| `marvel`                   | Marvel                   |
| `transformers`             | Transformers             |
| `g-i-joe`                  | G.I. Joe                 |
| `star-wars`                | Star Wars                |
| `masters-of-the-universe`  | Masters of The Universe  |
| `one-piece`                | One Piece                |
| `demon-slayer`             | Demon Slayer             |
| `naruto`                   | Naruto                   |
| `dragon-ball-z`            | Dragon Ball Z            |
| `attack-on-titans`         | Attack On Titan          |
| `jujutsu-kaisen`           | Jujutsu Kaisen           |
| `harry-potter`             | Harry Potter             |
| `the-adventures-of-tintin` | The Adventures of Tintin |
| `warhammer-40000`          | Warhammer 40,000         |
| `wwe`                      | WWE                      |
| `aliens-predators`         | ALIENS & PREDATORS       |
| `animation-1`              | Animation                |
| `anime-japanese`           | Anime/Japanese           |
| `assassins-creed`          | Assassin's Creed         |
| `batman`                   | Batman                   |
| `black-panther`            | Black Panther            |
| `action-figures`           | Action Figures           |
| `1-6-scale`                | 1/6 Scale                |
| `puzzles`                  | Puzzles                  |
| `whats-new`                | What's New               |

#### Brand Collections

| Slug                     | Display Name                                   |
| ------------------------ | ---------------------------------------------- |
| `hot-toys`               | Hot Toys                                       |
| `sideshow`               | Sideshow                                       |
| `iron-studios`           | Iron Studios                                   |
| `prime-1-studios`        | Prime 1 Studios                                |
| `mcfarlane-toys`         | McFarlane Toys                                 |
| `first-4-figures`        | First 4 Figures                                |
| `super7`                 | Super7                                         |
| `funko`                  | Funko                                          |
| `threezero-1`            | Threezero                                      |
| `neca`                   | NECA                                           |
| `mezco-toys`             | Mezco Toys                                     |
| `diamond`                | Diamond                                        |
| `storm-collectibles`     | Storm Collectibles                             |
| `tsume-art`              | Tsume Art                                      |
| `infinity-studios`       | Infinity Studios                               |
| `kotobukiya`             | Kotobukiya                                     |
| `inart`                  | INART                                          |
| `queen-studios`          | Queen Studios                                  |
| `bandai-tamashii`        | Bandai Tamashii (S.H.Figuarts, Revoltech etc.) |
| `bandai-namco`           | Bandai Namco                                   |
| `banpresto`              | Banpresto                                      |
| `aquarius-entertainment` | Aquarius Entertainment                         |

---

### 2.4 Footer Structure

```
[Trust Badges Row]
  Free Shipping (pan-India)  ·  Customer Service (Mon–Fri)  ·  Earn FCC Coins  ·  Secure Payment (RazorPay)

[4-column footer grid]
  Our Info                Shop              Store Policies          Contact
  ────────────────────    ──────────────    ────────────────────    ──────────────────────────────
  Home                    My Account        Terms & Conditions      Email: fatcatcollectibles.in@gmail.com
  Search                  My Wishlist       Privacy Policy          Customer Care WA: +91 7620783819
  Blog                    My Orders         Shipping Policy         Customer Care Phone: +91 7620783819
  About                   My Addresses      Refund Policy           Statues Queries: +91 7887888187
  Contact Us                                                        PUNE: A-1 GF, Ashiana Park, Koregaon Park - 411001
                                                                    BENGALURU: 1134, 100 Feet Rd, Indiranagar - 560008
                                                                    Support: Mon–Fri 11am–8pm IST

[Newsletter Signup]  Email input + Subscribe button

[Social Links]  Facebook · Instagram · WhatsApp

[Copyright]  © 2026, FATCAT COLLECTIBLES
[SSL Badge]  GoDaddy SSL seal
```

All footer content (links, contact info, locations, social URLs, copyright text) sourced from Firestore `siteConfig/main`.

---

## 3. Dynamic Content Map

Every piece of content that was hardcoded on the original Shopify site is made fully dynamic via Firestore. Admins change content without a deployment.

| Content Area                           | Firestore Collection         | Dynamic Fields                                                             |
| -------------------------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| Hero / Announcement Banner             | `banners`                    | text, subtext, CTA label, CTA URL, bg color/image, active flag, sort order |
| Top announcement bar                   | `announcements`              | message, link, active flag                                                 |
| Collection list (nav + homepage strip) | `collections`                | name, slug, type (franchise/brand), image, sort order, active              |
| Brand logo strip                       | `collections` (type = brand) | logo image, href slug, sort order                                          |
| Featured collection                    | `homeSections`               | title, collectionSlug, itemLimit, sort order, active                       |
| Bestsellers / Populars section         | `homeSections`               | same as above                                                              |
| Mid-page promo banners (4 tiles)       | `promobanners`               | title, ctaLabel, ctaUrl, image, sortOrder, active                          |
| Products                               | `products`                   | all fields (see schema)                                                    |
| Testimonials carousel                  | `testimonials`               | name, rating, text, featured, sort order                                   |
| FAQ accordion                          | `faq`                        | question, answer, sort order, active                                       |
| Blog posts                             | `blog`                       | title, slug, body (rich text), cover image, tags, published                |
| Policy pages                           | `pages`                      | slug (terms / privacy / shipping / refund), title, body (rich text)        |
| Store locations                        | `locations`                  | city, address, phone, mapUrl, active                                       |
| Social links                           | `siteConfig`                 | facebook, instagram, whatsapp, newsletter signup text                      |
| Footer columns                         | `siteConfig`                 | all footer link groups                                                     |
| SEO metadata                           | `siteConfig` + per-document  | title, description, ogImage per page                                       |
| Low stock threshold (global)           | `siteConfig`                 | `inventoryLowStockDefault` (number)                                        |
| WhatsApp numbers                       | `siteConfig`                 | customerCare, statues, adminBot                                            |
| Order status labels + colors           | `orderStatusConfig`          | label, color, notifyCustomer flag, WA template                             |
| Loyalty coin rates                     | `loyaltyConfig`              | coinsPerRupee, redemptionRate, minimumRedeemable                           |
| Promo / discount rules                 | `discounts`                  | code, type (percent/flat), value, minOrder, expiry, active                 |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Client (Browser / Mobile)                                   │
│  Next.js App Router — SSR + ISR + Client Islands            │
│  Tailwind CSS · Zustand (cart, wishlist) · Firebase SDK      │
└──────────────┬───────────────────────────┬───────────────────┘
               │ HTTPS                     │ Real-time onSnapshot
               ▼                           ▼
┌──────────────────────────┐   ┌───────────────────────────────┐
│  Next.js API Routes       │   │  Firebase Firestore            │
│  /api/webhooks/whatsapp   │   │  (DB + real-time)             │
│  /api/auth/[...nextauth]  │   ├───────────────────────────────┤
│  /api/admin/orders        │   │  Firebase Auth                │
│  /api/admin/products      │   ├───────────────────────────────┤
│  /api/sitemap             │   │  Firebase Storage             │
│  /api/revalidate          │   │  (product images, blog media) │
└──────────────┬────────────┘   └───────────────────────────────┘
               │
               ▼
┌──────────────────────────┐
│  Firebase Cloud Functions │
│  onProductWrite()         │  → low stock / sold-out WA alert
│  onOrderWrite()           │  → status-change WA to customer
│  onUserCoinUpdate()       │  → coin balance guard
│  scheduledSitemapRebuild()│  → daily ISR revalidation
└──────────────────────────┘
               │
               ▼
┌──────────────────────────┐
│  WhatsApp Business API   │
│  (Twilio / Wati.io)      │
│  Outbound: order alerts  │
│  Inbound:  bot commands  │
└──────────────────────────┘
```

---

## 5. Folder Structure

### Root Layout

```
fatcat/                                   # Monorepo root
├── app/                                  # Next.js App Router root
├── components/
├── constants/
├── lib/
├── hooks/
├── types/
├── store/
├── functions/                            # Firebase Cloud Functions (separate package)
├── public/
├── scripts/                              # One-off dev/data scripts
├── .env.local                            # Local secrets (never committed)
├── .env.example                          # Checked-in reference of all required env vars
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── tsconfig.paths.json                   # Path aliases (@/lib, @/components, etc.)
├── middleware.ts                         # Auth guard for /admin/** + /account/**
├── firebase.json                         # Firebase project config (hosting, functions)
├── firestore.rules                       # Firestore Security Rules
├── firestore.indexes.json                # Composite index definitions
├── storage.rules                         # Firebase Storage Security Rules
└── package.json
```

---

### `app/` — Next.js App Router

```
app/
├── layout.tsx                            # Root layout — <html>, fonts, global providers
├── globals.css                           # Tailwind base + custom CSS variables
├── not-found.tsx                         # Global 404 page
├── error.tsx                             # Global error boundary
├── loading.tsx                           # Global suspense fallback
│
├── (storefront)/                         # Route group: public storefront
│   ├── layout.tsx                        # Navbar + Footer + AnnouncementBar + CartProvider
│   │
│   ├── page.tsx                          # / — Homepage (ISR revalidate: 300)
│   │                                     # Sections (all dynamic from Firestore):
│   │                                     #   AnnouncementBar (announcements)
│   │                                     #   HeroBanner carousel (banners)
│   │                                     #   CollectionStrip — franchise (collections type=franchise)
│   │                                     #   BrandStrip — brand logos (collections type=brand)
│   │                                     #   HomeSections[] — featured + bestsellers (homeSections)
│   │                                     #   PromoGrid — 4 inline banners (promobanners)
│   │                                     #   TestimonialsCarousel (testimonials)
│   │                                     #   FAQAccordion (faq)
│   │                                     #   TrustBadges (siteConfig.trustBadges)
│   │                                     #   NewsletterSignup
│   │
│   ├── collections/
│   │   ├── page.tsx                      # /collections — All collections index (ISR 300s)
│   │   │                                 # Alphabetical grid of all collection tiles (paginated)
│   │   └── [slug]/
│   │       ├── page.tsx                  # /collections/[slug] — Product grid (ISR 300s)
│   │       │                             # Reads: collection banner, title, description,
│   │       │                             # product count, filter/sort, product grid, pagination
│   │       └── loading.tsx               # Skeleton: banner shimmer + product grid skeleton
│   │
│   ├── products/
│   │   └── [slug]/
│   │       ├── page.tsx                  # /products/[slug] — Product detail (ISR 300s)
│   │       │                             # Sections: image gallery (up to 20 imgs + zoom),
│   │       │                             # brand link, title, PriceTag, description, ETA,
│   │       │                             # qty stepper, wishlist btn, add-to-cart/pre-order CTA,
│   │       │                             # buy-it-now CTA, TrustBadges
│   │       ├── loading.tsx               # Skeleton: gallery + detail shimmer
│   │       └── _components/
│   │           ├── ImageGallery.tsx      # Client: thumbnail filmstrip + main image + zoom modal
│   │           ├── AddToCartSection.tsx  # Client island: qty stepper + add to cart + buy now
│   │           ├── WishlistButton.tsx    # Client island: heart toggle → Zustand wishlist
│   │           └── RelatedProducts.tsx   # Server: products from same franchise/brand
│   │
│   ├── search/
│   │   ├── page.tsx                      # /search — Full-text search results (SSR, no cache)
│   │   │                                 # ?q= query param → Firestore prefix query
│   │   │                                 # Same ProductGrid + filter/sort as collection page
│   │   └── loading.tsx
│   │
│   ├── cart/
│   │   └── page.tsx                      # /cart — Cart page
│   │                                     # Empty state: "Your cart is empty" + "Continue shopping"
│   │                                     # Populated: line items, qty stepper, remove, subtotal,
│   │                                     # "Check Out" → /checkout
│   │
│   ├── checkout/
│   │   ├── page.tsx                      # /checkout — Our WhatsApp checkout (replaces Shopify)
│   │   └── _components/
│   │       ├── AddressForm.tsx           # Name, phone, line1, line2, city, state, pincode
│   │       ├── SavedAddressPicker.tsx    # Select from account addresses (logged-in users)
│   │       ├── CoinRedeemToggle.tsx      # "Use X coins (save ₹Y)" toggle
│   │       ├── DiscountCodeInput.tsx     # Code input + validate against Firestore discounts
│   │       └── OrderSummary.tsx          # Readonly: items, subtotal, discount, coins, total
│   │
│   ├── orders/
│   │   └── [orderId]/
│   │       └── track/
│   │           ├── page.tsx              # /orders/[id]/track — Order tracking (our addition)
│   │           │                         # Vertical status stepper, real-time via onSnapshot,
│   │           │                         # courier + tracking link when status ≥ shipped
│   │           └── loading.tsx
│   │
│   ├── account/
│   │   ├── layout.tsx                    # Account sidebar: Profile · Orders · Wishlist · Addresses
│   │   ├── page.tsx                      # /account — Profile info + FCC coin balance + quick links
│   │   ├── orders/
│   │   │   ├── page.tsx                  # /account/orders — Order list (ID, date, total, status, Track)
│   │   │   └── [orderId]/
│   │   │       └── page.tsx              # /account/orders/[id] — Line items, totals, address, timeline
│   │   ├── wishlist/
│   │   │   └── page.tsx                  # /account/wishlist — Product grid from users.wishlist[]
│   │   └── addresses/
│   │       └── page.tsx                  # /account/addresses — Cards: Add/Edit/Delete/Set default
│   │
│   ├── blog/
│   │   ├── page.tsx                      # /blog — Post index grid (ISR 3600s)
│   │   │                                 # Empty state: "No posts yet" until admin publishes
│   │   └── [slug]/
│   │       ├── page.tsx                  # /blog/[slug] — Post: cover, title, author, date, body
│   │       └── loading.tsx
│   │
│   ├── policies/
│   │   └── [policy]/
│   │       └── page.tsx                  # /policies/[policy] — Policy pages (ISR 3600s)
│   │                                     # Slugs: terms-of-service · privacy-policy ·
│   │                                     #        shipping-policy · refund-policy
│   │                                     # Content from Firestore `pages/{policy}`
│   │
│   └── [pageSlug]/
│       └── page.tsx                      # /about, /contact — Info pages (ISR 3600s)
│                                         # about: company history, authorised distributors list
│                                         # contact: contact form (Name/Email/Message) + store info
│
├── (auth)/                               # Route group: auth screens (no Navbar/Footer)
│   ├── layout.tsx                        # Centered card layout
│   ├── login/
│   │   └── page.tsx                      # /login — Email + Password + Google OAuth
│   ├── register/
│   │   └── page.tsx                      # /register — Name + Email + Password + Google
│   └── forgot-password/
│       └── page.tsx                      # /forgot-password — Email input → Firebase reset email
│
├── (admin)/                              # Route group: admin panel (auth-gated in layout)
│   ├── layout.tsx                        # Admin shell: sidebar nav + session check
│   │
│   ├── admin/
│   │   ├── page.tsx                      # /admin — Dashboard: stats, recent orders, low-stock
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx                  # /admin/products — List, search, quick-stock edit
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # /admin/products/new — Create product form
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx              # /admin/products/[id] — Edit product
│   │   │   └── bulk-upload/
│   │   │       └── page.tsx              # /admin/products/bulk-upload — CSV upload UI
│   │   │
│   │   ├── orders/
│   │   │   ├── page.tsx                  # /admin/orders — List, filter by status/date
│   │   │   └── [id]/
│   │   │       └── page.tsx              # /admin/orders/[id] — Detail + status change + WA notify
│   │   │
│   │   ├── collections/
│   │   │   ├── page.tsx                  # /admin/collections — List, reorder drag-and-drop
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── content/
│   │   │   ├── page.tsx                  # /admin/content — Tabs: Banners, Sections, FAQs, Testimonials
│   │   │   ├── banners/
│   │   │   │   └── page.tsx
│   │   │   ├── home-sections/
│   │   │   │   └── page.tsx
│   │   │   ├── testimonials/
│   │   │   │   └── page.tsx
│   │   │   ├── faq/
│   │   │   │   └── page.tsx
│   │   │   └── announcements/
│   │   │       └── page.tsx
│   │   │
│   │   ├── blog/
│   │   │   ├── page.tsx                  # /admin/blog — Post list
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Rich-text editor
│   │   │
│   │   ├── pages/
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # /admin/pages/[slug] — Edit policy/info page body
│   │   │
│   │   ├── loyalty/
│   │   │   └── page.tsx                  # /admin/loyalty — Config editor + top holders + manual grant
│   │   │
│   │   ├── discounts/
│   │   │   ├── page.tsx                  # /admin/discounts — Code list
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   │
│   │   └── config/
│   │       └── page.tsx                  # /admin/config — siteConfig editor (WA numbers, SEO, support hours)
│   │
└── api/
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts                  # NextAuth.js handler (Firebase adapter)
    ├── checkout/
    │   └── route.ts                      # POST: validate → write order → reserve stock → return WA URL
    ├── webhooks/
    │   └── whatsapp/
    │       └── route.ts                  # POST: inbound WA bot (HMAC verified)
    ├── admin/
    │   ├── orders/
    │   │   └── [id]/
    │   │       └── status/
    │   │           └── route.ts          # PATCH: update order status (admin only)
    │   └── products/
    │       └── bulk-upload/
    │           └── route.ts              # POST: CSV → Firestore batch write
    ├── revalidate/
    │   └── route.ts                      # POST: on-demand ISR revalidation (secret-token auth)
    └── sitemap/
        └── route.ts                      # GET: dynamic XML sitemap
```

---

### `components/` — UI Component Library

```
components/
│
├── ui/                                   # Primitive, reusable UI atoms
│   ├── Button.tsx                        # variant: primary | secondary | ghost | danger
│   ├── Badge.tsx                         # variant: sale | preorder | soldout | new | coin
│   ├── Input.tsx                         # Controlled text input with label + error
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Modal.tsx                         # Portal-based modal with backdrop
│   ├── Drawer.tsx                        # Slide-in panel (cart, mobile menu)
│   ├── Toast.tsx                         # Notification toasts via context
│   ├── ToastProvider.tsx
│   ├── Skeleton.tsx                      # Base skeleton shimmer
│   ├── Spinner.tsx
│   ├── Tabs.tsx
│   ├── Accordion.tsx                     # Used for FAQ
│   ├── RichTextRenderer.tsx              # Renders DOMPurify-sanitised HTML
│   └── StarRating.tsx                    # 1–5 star display (testimonials)
│
├── product/
│   ├── ProductCard.tsx                   # Used in: homepage, collections, search, wishlist, admin picker
│   ├── ProductCard.skeleton.tsx          # Matching skeleton for ProductCard
│   ├── ProductGrid.tsx                   # Responsive grid wrapper
│   ├── PriceTag.tsx                      # Handles sale / regular / sold-out / pre-order display
│   ├── StockBadge.tsx                    # "In Stock" | "Low Stock" | "Sold Out" | "Pre-order"
│   ├── ProductImageGallery.tsx           # Thumbnail strip + zoom lightbox
│   ├── ProductSpecsTable.tsx             # Renders specs Record<string, string>
│   └── ProductFilterSidebar.tsx          # Price, brand, franchise, in-stock filters
│
├── layout/
│   ├── Navbar.tsx                        # Logo, nav links (from Firestore collections), cart icon, account
│   ├── NavCollectionsMenu.tsx            # Mega-menu dropdown populated from Firestore
│   ├── MobileMenu.tsx                    # Full-screen mobile nav drawer
│   ├── Footer.tsx                        # Links, social icons, newsletter — all from siteConfig
│   ├── AnnouncementBar.tsx               # Top bar — reads active `announcements` from Firestore
│   └── Providers.tsx                     # Wraps: AuthProvider, CartProvider, ToastProvider, QueryClientProvider
│
├── home/
│   ├── HeroBanner.tsx                    # Auto-advancing carousel — reads from Firestore `banners`
│   ├── CollectionStrip.tsx               # Scrollable franchise tile row — reads `collections` (type=franchise)
│   ├── BrandStrip.tsx                    # Horizontal logo scroll — reads `collections` (type=brand)
│   ├── HomeSection.tsx                   # Generic titled product row (featured / bestseller / new-arrivals)
│   ├── HomeSectionList.tsx               # Renders all active `homeSections` in sortOrder
│   ├── PromoGrid.tsx                     # 4-tile inline promo banners — reads Firestore `promobanners`
│   ├── TestimonialsCarousel.tsx          # Reads featured `testimonials` from Firestore
│   └── FAQAccordion.tsx                  # Reads `faq` from Firestore
│
├── cart/
│   ├── CartDrawer.tsx                    # Slide-in cart panel
│   ├── CartItem.tsx                      # Single line item: image, name, qty stepper, remove
│   ├── CartSummary.tsx                   # Subtotal, coins, discount, total
│   └── EmptyCart.tsx
│
├── checkout/
│   ├── AddressForm.tsx                   # Controlled form: name, phone, address fields
│   ├── SavedAddressPicker.tsx            # Select from account addresses
│   ├── CoinRedeemToggle.tsx              # Toggle + shows amount saved
│   ├── DiscountCodeInput.tsx             # Input + validate + display saving
│   └── OrderSummary.tsx                  # Read-only cart + totals at checkout
│
├── order/
│   ├── OrderStatusStepper.tsx            # Vertical timeline — steps from Firestore `orderStatusConfig`
│   ├── OrderStatusBadge.tsx              # Colour-coded badge using `orderStatusConfig`
│   ├── OrderCard.tsx                     # Compact order row for account/orders list
│   ├── OrderItemList.tsx                 # Line items in order detail
│   └── TrackingBanner.tsx                # Shows courier + tracking link when shipped
│
├── account/
│   ├── AccountSidebar.tsx                # Nav: Profile, Orders, Wishlist, Addresses
│   ├── CoinBalanceCard.tsx               # Displays balance + history link
│   └── AddressCard.tsx                   # Address display + edit/delete actions
│
├── blog/
│   ├── PostCard.tsx                      # Blog index card: cover, title, excerpt, date
│   └── PostBody.tsx                      # Renders sanitised rich-text post body
│
└── admin/
    ├── AdminSidebar.tsx                  # Nav links for all admin sections
    ├── AdminStatCard.tsx                 # Metric card used on dashboard
    ├── ProductForm.tsx                   # Shared new/edit product form
    ├── ProductTableRow.tsx               # Row in admin product list with inline stock edit
    ├── BulkUploadForm.tsx                # CSV file upload + preview + confirm submit
    ├── OrderTable.tsx                    # Filterable order list
    ├── StatusChangeForm.tsx              # Dropdown (valid transitions only) + note + AWB + WA toggle
    ├── InventoryEditForm.tsx             # Stock, threshold, restock note fields
    ├── CameraCapture.tsx                 # Device camera UI: image snapshot + video recording → upload to Firebase Storage
    ├── CollectionForm.tsx                # Franchise/brand collection create/edit
    ├── BannerForm.tsx
    ├── HomeSectionForm.tsx
    ├── TestimonialForm.tsx
    ├── FAQForm.tsx
    ├── AnnouncementForm.tsx
    ├── ContentEditor.tsx                 # Rich-text editor (Tiptap) for blog + pages
    ├── LoyaltyConfigForm.tsx
    ├── DiscountForm.tsx
    ├── SiteConfigForm.tsx                # All siteConfig fields in one tabbed form
    └── DraggableList.tsx                 # Generic drag-to-reorder list (collections, sections)
```

---

### `constants/` — Single Source of Truth

```
constants/
├── firebase.ts                           # COLLECTIONS map — all Firestore collection names
├── routes.ts                             # ROUTES map — all internal URL builders
├── whatsapp.ts                           # INVENTORY_COMMANDS, message template keys
├── orderStatus.ts                        # ORDER_STATUS_TRANSITIONS fallback map
├── inventory.ts                          # DEFAULT_LOW_STOCK_THRESHOLD, RESTOCK_NOTE_MAX_LEN
└── ui.ts                                 # BREAKPOINTS, Z_INDEX, ANIMATION_MS, TOAST_DURATION_MS
```

---

### `lib/` — Business Logic & Data Layer

```
lib/
│
├── firebase/
│   ├── client.ts                         # getFirebaseApp() singleton — client SDK init
│   ├── admin.ts                          # getAdminApp() singleton — Admin SDK (server-only)
│   ├── products.ts                       # getProduct(), getProducts(), createProduct(),
│   │                                     # updateProduct(), searchProducts(), getRelated()
│   ├── orders.ts                         # createOrder(), getOrder(), getUserOrders(),
│   │                                     # updateOrderStatus(), releaseReservedStock()
│   ├── users.ts                          # getUser(), updateUser(), awardCoins(),
│   │                                     # redeemCoins(), addAddress(), removeAddress()
│   ├── collections.ts                    # getCollection(), getAllCollections(),
│   │                                     # getActiveCollectionsByType()
│   ├── content.ts                        # getBanners(), getHomeSections(), getTestimonials(),
│   │                                     # getFAQ(), getAnnouncements(), getPage(), getBlogPost()
│   ├── discounts.ts                      # validateDiscount(), incrementDiscountUsage()
│   └── config.ts                         # getSiteConfig(), getOrderStatusConfig(), getLoyaltyConfig()
│
├── whatsapp.ts                           # buildCheckoutMessageURL(), buildStatusNotificationURL(),
│                                         # parseIncomingWebhook(), verifyWebhookSignature(),
│                                         # isAdminNumber(), buildHelpMessage()
│
├── inventory.ts                          # buildLowStockAlertMessage(), buildSoldOutAlertMessage(),
│                                         # parseRestockCommand(), parseStatusCommand()
│
├── loyalty.ts                            # calculateCoinsEarned(), calculateMaxRedeemable(),
│                                         # applyCoinsToOrder()
│
├── formatCurrency.ts                     # formatINR(amount: number): string
│                                         # formatINRCompact(amount: number): string  (₹1.2L)
│
└── seo.ts                                # generateProductMetadata(), generateCollectionMetadata(),
                                          # generateBlogMetadata(), generateDefaultMetadata()
```

---

### `hooks/` — React Hooks

```
hooks/
├── useCart.ts                            # Zustand cart store + localStorage persist
├── useWishlist.ts                        # Zustand wishlist store + localStorage persist
├── useAuth.ts                            # Firebase onAuthStateChanged wrapper
├── useSiteConfig.ts                      # Firestore onSnapshot for siteConfig/main
├── useOrderStatusConfig.ts               # Firestore onSnapshot for all orderStatusConfig docs
├── useMediaQuery.ts                      # Responsive hook using BREAKPOINTS constant
└── useDebounce.ts                        # Generic debounce for search input
```

---

### `store/` — Zustand Stores

```
store/
├── cartStore.ts                          # items[], add(), remove(), updateQty(), clear(), total
└── wishlistStore.ts                      # productIds[], toggle(), has()
```

---

### `types/` — TypeScript Type Definitions

```
types/
├── product.ts                            # Product, RestockEvent, ProductFilters, ProductSortOption
├── order.ts                              # Order, OrderItem, OrderStatus, OrderStatusEvent, Address
├── user.ts                               # User, CoinHistoryEntry, UserRole
├── cart.ts                               # CartItem
├── content.ts                            # Banner, HomeSection, Testimonial, FAQItem,
│                                         # Announcement, BlogPost, ContentPage
└── config.ts                             # SiteConfig, SiteLocation, LoyaltyConfig,
                                          # OrderStatusConfig, Discount
```

---

### `functions/` — Firebase Cloud Functions

```
functions/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                          # Exports all functions
    │
    ├── onProductWrite.ts                 # Trigger: products/{id} write
    │                                     # → Recalculate availableStock = stock - reservedStock
    │                                     # → Set inStock flag
    │                                     # → Send low-stock / sold-out WA alert to admin
    │
    ├── onOrderWrite.ts                   # Trigger: orders/{id} write
    │                                     # → On status → "delivered": award FCC coins to user
    │                                     # → On status → "delivered": release reservedStock
    │                                     # → On status → "cancelled": release reservedStock
    │
    ├── onOrderStatusChange.ts            # Trigger: orders/{id} update (currentStatus field)
    │                                     # → Read orderStatusConfig for new status
    │                                     # → If notifyCustomer=true: send WA via WhatsApp API
    │
    ├── onUserCoinUpdate.ts               # Trigger: users/{id} update (fccCoins field)
    │                                     # → Guard: if fccCoins < 0, reset to 0 + log warning
    │
    └── scheduledSitemapRebuild.ts        # Cloud Scheduler: daily 2am IST
                                          # → POST /api/revalidate for homepage + sitemap
```

---

### `scripts/` — Developer Utilities

```
scripts/
├── seed-firestore.ts                     # Populate Firestore with sample products/collections
├── import-products-csv.ts                # One-off CSV import to Firestore
└── export-orders-csv.ts                  # Dump orders collection to CSV for accounting
```

---

### `public/` — Static Assets

```
public/
├── favicon.ico
├── og-default.png                        # Default Open Graph image (1200×630)
├── logo.svg
├── icons/
│   ├── whatsapp.svg
│   ├── cart.svg
│   ├── heart.svg
│   ├── search.svg
│   └── user.svg
└── fonts/                                # Self-hosted fonts (if not using next/font)
```

---

## 6. Firestore Schema

### `products/{id}`

```ts
{
  id: string;
  name: string;
  slug: string;                   // URL-safe, unique
  images: string[];               // Firebase Storage URLs
  salePrice: number;              // in paise or INR float
  regularPrice: number;
  franchise: string;              // e.g. "marvel"
  brand: string;                  // e.g. "hot-toys"
  tags: string[];                 // e.g. ["sixth-scale", "deluxe"]
  description: string;            // rich text / HTML
  specs: Record<string, string>;  // e.g. { Scale: "1:6", Material: "Die-cast" }
  stock: number;
  reservedStock: number;          // units in pending/confirmed orders
  availableStock: number;         // Cloud Function keeps: stock - reservedStock
  inStock: boolean;               // denormalized for query perf
  isPreorder: boolean;
  preorderShipDate?: string;      // e.g. "Q2 2026"
  lowStockThreshold: number;      // per-product, fallback to siteConfig default
  isFeatured: boolean;
  isBestseller: boolean;
  seoTitle?: string;
  seoDescription?: string;
  videos: string[];               // Firebase Storage URLs (mp4/webm) of product videos
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastRestockedAt?: Timestamp;
  restockHistory: RestockEvent[];
}
```

### `orders/{id}`

```ts
{
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    image: string;
    qty: number;
    salePrice: number;
    slug: string;
  }[];
  subtotal: number;
  coinsRedeemed: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  address: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  currentStatus: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: Timestamp;
    note?: string;
    updatedBy: string;          // admin UID or "system"
  }[];
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  whatsappSent: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `users/{uid}`

```ts
{
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  fccCoins: number;
  coinHistory: {
    delta: number;
    reason: string;             // "purchase", "redemption", "admin-grant"
    orderId?: string;
    timestamp: Timestamp;
  }[];
  addresses: Address[];
  wishlist: string[];           // product IDs
  role: "customer" | "admin";
  createdAt: Timestamp;
}
```

### `collections/{slug}`

```ts
{
  slug: string;
  name: string;
  type: "franchise" | "brand";
  bannerImage: string;
  logoImage?: string;           // for brand strip
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  active: boolean;
}
```

### `banners/{id}`

```ts
{
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  sortOrder: number;
  active: boolean;
}
```

### `promobanners/{id}`

```ts
{
  title: string; // e.g. "The Adventures of Tintin"
  ctaLabel: string; // e.g. "Buy Now" | "Explore"
  ctaUrl: string; // e.g. "/collections/the-adventures-of-tintin"
  image: string; // Firebase Storage URL
  sortOrder: number; // 1–4 (4 tiles shown on homepage)
  active: boolean;
}
```

### `homeSections/{id}`

```ts
{
  title: string;
  subtitle?: string;
  collectionSlug?: string;      // pull products from this collection
  manualProductIds?: string[];  // OR handpick products
  itemLimit: number;
  sortOrder: number;
  active: boolean;
  type: "featured" | "bestseller" | "new-arrivals" | "custom";
}
```

### `announcements/{id}`

```ts
{
  message: string;
  link?: string;
  linkLabel?: string;
  active: boolean;
  sortOrder: number;
  bgColor?: string;
  textColor?: string;
}
```

### `testimonials/{id}`

```ts
{
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  avatarUrl?: string;
  featured: boolean;
  sortOrder: number;
  active: boolean;
}
```

### `faq/{id}`

```ts
{
  question: string;
  answer: string; // HTML / rich text
  sortOrder: number;
  active: boolean;
}
```

### `blog/{id}`

```ts
{
  title: string;
  slug: string;
  coverImage: string;
  body: string;                 // rich text / MDX
  excerpt?: string;
  tags: string[];
  authorName: string;
  authorAvatar?: string;
  publishedAt: Timestamp;
  updatedAt: Timestamp;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
}
```

### `pages/{slug}`

```ts
{
  slug: string;                 // "terms", "privacy", "shipping", "refund", "about", "contact"
  title: string;
  body: string;                 // rich text / HTML
  updatedAt: Timestamp;
  seoTitle?: string;
  seoDescription?: string;
}
```

### `siteConfig/main`

```ts
{
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  faviconUrl: string;
  defaultOgImage: string;
  contactEmail: string;
  whatsappCustomerCare: string;
  whatsappStatues: string;
  whatsappAdminBot: string;
  phoneCustomerCare: string;
  facebookUrl: string;
  instagramUrl: string;
  supportHours: string; // "Monday to Friday, 11am – 8pm IST"
  freeShippingMinimum: number; // 0 = always free
  inventoryLowStockDefault: number;
  noIndexAdmin: boolean;
  footerCopyright: string;
  locations: {
    city: string;
    address: string;
    phone: string;
    mapUrl: string;
    active: boolean;
  }
  [];
}
```

### `loyaltyConfig/main`

```ts
{
  coinsPerRupee: number; // e.g. 1 coin per ₹100
  rupeePerCoin: number; // e.g. 1 coin = ₹1
  minCoinsToRedeem: number;
  maxRedeemPercent: number; // e.g. 10 = max 10% of order payable in coins
  active: boolean;
}
```

### `discounts/{code}`

```ts
{
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  applicableCollections?: string[];  // empty = all
  expiresAt?: Timestamp;
  active: boolean;
}
```

### `orderStatusConfig/{status}`

```ts
{
  status: string; // e.g. "shipped"
  label: string; // "Shipped"
  color: string; // Tailwind color name
  notifyCustomer: boolean;
  waTemplate: string; // message with {orderId}, {trackingNumber} placeholders
  sortOrder: number; // for stepper display
}
```

---

## 7. Constants & DRY Design

### `constants/firebase.ts`

```ts
export const COLLECTIONS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  USERS: "users",
  COLLECTIONS: "collections",
  BANNERS: "banners",
  HOME_SECTIONS: "homeSections",
  PROMO_BANNERS: "promobanners",
  ANNOUNCEMENTS: "announcements",
  TESTIMONIALS: "testimonials",
  FAQ: "faq",
  BLOG: "blog",
  PAGES: "pages",
  DISCOUNTS: "discounts",
  LOYALTY_CONFIG: "loyaltyConfig",
  ORDER_STATUS_CONFIG: "orderStatusConfig",
  SITE_CONFIG: "siteConfig",
} as const;
```

### `constants/routes.ts`

```ts
export const ROUTES = {
  HOME: "/",
  SEARCH: "/search",
  CART: "/cart",
  CHECKOUT: "/checkout",
  BLOG: "/blog",
  ACCOUNT: "/account",
  ACCOUNT_ORDERS: "/account/orders",
  ACCOUNT_WISHLIST: "/account/wishlist",
  ACCOUNT_ADDRESSES: "/account/addresses",
  COLLECTION: (slug: string) => `/collections/${slug}`,
  PRODUCT: (slug: string) => `/products/${slug}`,
  ORDER_TRACK: (id: string) => `/orders/${id}/track`,
  PAGE: (slug: string) => `/${slug}`,
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_CONTENT: "/admin/content",
  ADMIN_CONFIG: "/admin/config",
} as const;
```

### `constants/orderStatus.ts`

```ts
// Static fallback — overridden at runtime by Firestore `orderStatusConfig`
export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ["payment_confirmed", "cancelled"],
  payment_confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: ["refund_initiated"],
  refund_initiated: [],
};
```

### `constants/whatsapp.ts`

```ts
export const INVENTORY_COMMANDS = {
  RESTOCK: "RESTOCK", // RESTOCK {sku} qty:{n}
  SOLDOUT: "SOLDOUT", // SOLDOUT {sku}
  PREORDER: "PREORDER", // PREORDER {sku} date:{Q-YYYY}
  STATUS: "STATUS", // STATUS {orderId} {newStatus} [awb:{n}]
  STOCK: "STOCK", // STOCK {sku}  → reply with count
  HELP: "HELP",
} as const;
```

### `lib/whatsapp.ts` — Builders (dynamic, read WA number from siteConfig)

```ts
export function buildCheckoutMessageURL(
  waNumber: string,
  cart: CartItem[],
  total: number,
  address: Address,
): string {
  const lines = cart.map(
    (i) => `• ${i.name} ×${i.qty} — ${formatINR(i.salePrice * i.qty)}`,
  );
  const body = [
    "Hi FatCat! I'd like to place an order:",
    "",
    ...lines,
    "",
    `*Total: ${formatINR(total)}*`,
    "",
    `Deliver to: ${address.name}, ${address.line1}, ${address.city} - ${address.pincode}`,
    "",
    "Please share payment details.",
  ].join("\n");
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(body)}`;
}

export function buildStatusNotificationURL(
  userPhone: string,
  template: string,
  vars: Record<string, string>,
): string {
  const body = template.replace(
    /\{(\w+)\}/g,
    (_, key) => vars[key] ?? `{${key}}`,
  );
  return `https://wa.me/${userPhone}?text=${encodeURIComponent(body)}`;
}
```

---

## 8. Feature Breakdown

### 8.1 Product Catalog

- **Collection pages** (`/collections/[slug]`): Server-rendered with ISR (revalidate: 300s). Filters by franchise or brand slug. Supports filter by in-stock, price range, brand/franchise cross-filter, and sort (newest, price asc/desc, bestseller).
- **Product detail** (`/products/[slug]`): SSR. Image gallery, specs table, `PriceTag` (handles sale/regular/sold-out/pre-order), add to cart/wishlist, related products section.
- **Search** (`/search`): Client-side Firestore query on `name` (prefix match via Algolia or Firestore `>=`/`<=` trick). Falls back to server route with `.where("tags", "array-contains", q)`.
- **`ProductCard`** is reused in: homepage sections, collection listing, search results, wishlist, admin product picker. Single component, zero duplication.

### 8.2 Cart & WhatsApp Checkout

```
User adds to cart → CartDrawer (Zustand, persisted localStorage)
  → Checkout page (address form + FCC coins toggle + discount code)
  → POST /api/checkout:
      1. Validate discount code against Firestore
      2. Check availableStock for each item
      3. Write order with status: "pending_payment"
      4. Increment reservedStock on each product
      5. Return orderId + WhatsApp URL
  → Redirect to WhatsApp with pre-filled message
  → Show /orders/{id}/track with "Awaiting Payment" status
```

### 8.3 Order Tracking

**Customer-facing stepper** (`/orders/[id]/track`):

- Auth-gated: order userId must match session user
- Reads `statusHistory` array for timeline
- `onSnapshot` listener for real-time status push
- Status labels, colors, and icons driven by Firestore `orderStatusConfig` (fully dynamic — admin changes label without deploy)
- Shows courier name + tracking link when status ≥ `shipped`

**Admin order management** (`/admin/orders/[id]`):

- Dropdown populated only with `ORDER_STATUS_TRANSITIONS[currentStatus]` — prevents illegal jumps
- Optional note + AWB number fields
- "Notify Customer via WhatsApp" toggle → opens `wa.me` link pre-filled with `orderStatusConfig.waTemplate` with `{orderId}`, `{trackingNumber}`, `{customerName}` replaced

**Status flow:**

```
pending_payment → payment_confirmed → processing → shipped → out_for_delivery → delivered
                                   ↘ cancelled → refund_initiated
```

### 8.4 Inventory Management via WhatsApp

#### Passive Alerts (Cloud Function → Admin WA)

Triggered on every `products/{id}` write:

| Condition                             | Alert                                               |
| ------------------------------------- | --------------------------------------------------- |
| `availableStock === 0`                | Sold-out alert with quick-link to mark as pre-order |
| `availableStock <= lowStockThreshold` | Low stock warning with unit count                   |
| First restock after sold-out          | Restock confirmation                                |

Alert message text pulled from `siteConfig` (dynamic), not hardcoded.

#### Active Bot Commands (Inbound WA Webhook)

Endpoint: `POST /api/webhooks/whatsapp`

| Command    | Syntax                            | Action                                              |
| ---------- | --------------------------------- | --------------------------------------------------- |
| `RESTOCK`  | `RESTOCK SKU-123 qty:50`          | Increments `stock`, appends `restockHistory`        |
| `SOLDOUT`  | `SOLDOUT SKU-123`                 | Sets `stock:0`, `inStock:false`, `availableStock:0` |
| `PREORDER` | `PREORDER SKU-123 date:Q3-2026`   | Sets `isPreorder:true`, `preorderShipDate`          |
| `STATUS`   | `STATUS ORD-456 shipped awb:9876` | Calls `updateOrderStatus()` with note               |
| `STOCK`    | `STOCK SKU-123`                   | Replies with current stock count                    |
| `HELP`     | `HELP`                            | Replies with command list                           |

- **Security**: HMAC signature verification on every webhook request. Only messages from `siteConfig.whatsappAdminBot` number are processed.
- All command verbs read from `INVENTORY_COMMANDS` constant — adding a new command = one constant key + one handler function.

### 8.5 Loyalty — FCC Coins

- Earn rate and redemption rate stored in Firestore `loyaltyConfig/main` — admin changes without deploy.
- Coins earned on `delivered` status (Cloud Function `onOrderWrite`).
- Coins redeemable at checkout up to `maxRedeemPercent` of order total.
- Cloud Function `onUserCoinUpdate` guards against negative balances.
- Full coin history logged on `users/{uid}.coinHistory`.
- Admin can grant coins manually from `/admin/orders/[id]` page.

### 8.6 Pre-orders

- Products with `isPreorder: true` show "Pre-order" badge, `preorderShipDate`, and different CTA ("Pre-order Now").
- Checkout flow identical to in-stock — WhatsApp message prefixed with "PRE-ORDER:".
- Order tagged `isPreorder: true` in Firestore.
- Admin can bulk-convert products to in-stock when shipment arrives (bulk upload or `RESTOCK` bot command).

### 8.7 Admin Panel

**Protected by:** Firebase Auth + Firestore `users/{uid}.role === "admin"` check in middleware.

| Page        | Features                                                                          |
| ----------- | --------------------------------------------------------------------------------- |
| Dashboard   | Order counts by status, revenue (last 7/30 days), low-stock alerts, recent orders |
| Products    | Search/filter list, quick stock edit inline, bulk CSV upload, individual edit; product form supports capturing images and videos directly from device camera via `CameraCapture` component (MediaDevices API / `<input capture>` fallback) — captured media uploaded to Firebase Storage and appended to `images[]` / `videos[]`     |
| Orders      | Filter by status, date, search by orderId/name, status update, WA notify          |
| Collections | Add/edit/reorder franchise + brand collections                                    |
| Content     | Edit banners, home sections, FAQs, testimonials, announcements, store locations   |
| Blog        | Rich-text editor for posts, publish/unpublish                                     |
| Pages       | Edit terms, privacy, shipping, refund, about, contact body                        |
| Loyalty     | Edit `loyaltyConfig`, view top coin holders, manual coin grant                    |
| Config      | Edit all `siteConfig` fields including WA numbers, SEO defaults, support hours    |

### 8.8 Blog & Content Pages

- Blog posts and policy pages stored in Firestore `blog` and `pages` collections.
- Rendered server-side with ISR (revalidate: 3600s).
- Rich text stored as HTML string, rendered via `dangerouslySetInnerHTML` with a strict DOMPurify sanitization pass on the server.
- On-demand revalidation: admin save triggers `POST /api/revalidate?path=/blog/[slug]` with a secret token.

---

## 9. API Routes

| Route                             | Method | Auth         | Purpose                                    |
| --------------------------------- | ------ | ------------ | ------------------------------------------ |
| `/api/webhooks/whatsapp`          | POST   | HMAC sig     | Inbound WhatsApp bot commands              |
| `/api/checkout`                   | POST   | User session | Create order, reserve stock, return WA URL |
| `/api/admin/orders/[id]/status`   | PATCH  | Admin        | Update order status                        |
| `/api/admin/products/bulk-upload` | POST   | Admin        | CSV → Firestore batch write                |
| `/api/revalidate`                 | POST   | Secret token | On-demand ISR revalidation                 |
| `/api/sitemap`                    | GET    | Public       | Dynamic XML sitemap from Firestore slugs   |

---

## 10. Cloud Functions

| Function                  | Trigger                                       | Purpose                                                                 |
| ------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| `onProductWrite`          | Firestore write: `products/{id}`              | Recalculate `availableStock`; send low-stock/sold-out WA alert to admin |
| `onOrderWrite`            | Firestore write: `orders/{id}`                | On `delivered`: award FCC coins; release reserved stock                 |
| `onOrderStatusChange`     | Firestore write: `orders/{id}` (status field) | Send customer WA notification using `orderStatusConfig.waTemplate`      |
| `onUserCoinUpdate`        | Firestore write: `users/{id}`                 | Guard `fccCoins` from going negative                                    |
| `scheduledSitemapRebuild` | Cloud Scheduler: daily 2am IST                | Trigger `/api/revalidate` for sitemap + homepage                        |

---

## 11. Security Design

| Concern               | Mitigation                                                                         |
| --------------------- | ---------------------------------------------------------------------------------- |
| Admin routes          | Firestore Security Rules: `role === "admin"` + Next.js middleware session check    |
| WhatsApp webhook      | HMAC-SHA256 signature verification on every request                                |
| WA bot commands       | Only accepted from `siteConfig.whatsappAdminBot` number                            |
| Stock race conditions | Firestore transactions used in `/api/checkout` for `availableStock` decrement      |
| Coin balance          | Cloud Function guards against negative values; server-only mutation                |
| User data isolation   | Firestore Rules: users can only read/write their own documents                     |
| Rich text XSS         | DOMPurify sanitization server-side before storing and before rendering             |
| Discount abuse        | `usedCount` incremented in transaction with `maxUses` check                        |
| SSRF                  | No server-side URL fetching from user input; only known Firebase/WA API domains    |
| Secrets               | All keys (Firebase SA, WA tokens) in environment variables, never in client bundle |

---

## 12. Phased Implementation Plan

Each phase ends with a commit on its own branch (`phase/N-name`) before merging to `dev`.  
**Phase gate:** typecheck ✓ · lint ✓ · build ✓ · manual smoke-test ✓

---

### 12.1 Phase 1 — Foundation

> **Branch:** `phase/1-foundation`  
> **Commit message:** `feat: Phase 1 — Foundation complete`

**Goal:** Runnable Next.js app with Firebase wired up, typed data layer, product browsing, cart, and WhatsApp checkout.

#### Checklist

**Project scaffold**

- [x] `npx create-next-app@latest fatcat --typescript --tailwind --eslint --app`
- [x] Add path aliases (`@/`) in `tsconfig.json` + `tsconfig.paths.json`
- [x] `.env.example` with all required vars documented
- [x] `.gitignore` including `.env.local`, `emulator-data/`, `.firebase/`
- [x] `.eslintrc.json` — enable `@typescript-eslint/no-explicit-any`
- [x] `.prettierrc` — semi: true, singleQuote: true, tabWidth: 2
- [x] `next.config.ts` — images: Firebase Storage domain whitelisted
- [x] `tailwind.config.ts` — custom colors (brand red, ink dark), font families
- [x] `package.json` scripts: dev, build, typecheck, lint, format, emulators, seed, deploy

**Firebase & config**

- [x] `firebase.json` — hosting + functions config
- [x] `firestore.rules` — Phase 1 baseline rules (public read products/collections, auth write orders/users)
- [x] `firestore.indexes.json` — indexes for: products by franchise+inStock, products by brand+inStock, orders by userId+createdAt
- [x] `storage.rules` — public read images, admin-only write
- [x] `lib/firebase/client.ts` — `getFirebaseApp()` singleton (client SDK)
- [x] `lib/firebase/admin.ts` — `getAdminApp()` singleton (Admin SDK, server-only)

**Constants (all collection names / routes / config as typed objects)**

- [x] `constants/firebase.ts` — `COLLECTIONS` map
- [x] `constants/routes.ts` — `ROUTES` map with builder functions
- [x] `constants/orderStatus.ts` — `ORDER_STATUS_TRANSITIONS` static fallback
- [x] `constants/whatsapp.ts` — `INVENTORY_COMMANDS`
- [x] `constants/inventory.ts` — `DEFAULT_LOW_STOCK_THRESHOLD`, `RESTOCK_NOTE_MAX_LEN`
- [x] `constants/ui.ts` — `BREAKPOINTS`, `Z_INDEX`, `ANIMATION_MS`, `TOAST_DURATION_MS`

**TypeScript types**

- [x] `types/product.ts` — `Product`, `RestockEvent`, `ProductFilters`, `ProductSortOption`
- [x] `types/order.ts` — `Order`, `OrderItem`, `OrderStatus`, `OrderStatusEvent`, `Address`
- [x] `types/user.ts` — `User`, `CoinHistoryEntry`, `UserRole`
- [x] `types/cart.ts` — `CartItem`
- [x] `types/content.ts` — `Banner`, `HomeSection`, `Testimonial`, `FAQItem`, `Announcement`, `BlogPost`, `ContentPage`
- [x] `types/config.ts` — `SiteConfig`, `SiteLocation`, `LoyaltyConfig`, `OrderStatusConfig`, `Discount`

**Data layer (lib)**

- [x] `lib/firebase/products.ts` — `getProduct()`, `getProducts()`, `searchProducts()`, `getRelated()`
- [x] `lib/firebase/collections.ts` — `getCollection()`, `getAllCollections()`, `getActiveCollectionsByType()`
- [x] `lib/firebase/config.ts` — `getSiteConfig()`, `getLoyaltyConfig()`
- [x] `lib/formatCurrency.ts` — `formatINR()`, `formatINRCompact()`
- [x] `lib/whatsapp.ts` — `buildCheckoutMessageURL()`, `buildStatusNotificationURL()`

**Zustand stores**

- [x] `store/cartStore.ts` — `items[]`, `add()`, `remove()`, `updateQty()`, `clear()`, `total` (localStorage persist)
- [x] `store/wishlistStore.ts` — `productIds[]`, `toggle()`, `has()` (localStorage persist)

**Hooks**

- [x] `hooks/useCart.ts`
- [x] `hooks/useWishlist.ts`
- [x] `hooks/useAuth.ts` — Firebase `onAuthStateChanged` wrapper
- [x] `hooks/useMediaQuery.ts`
- [x] `hooks/useDebounce.ts`

**UI primitives (`components/ui/`)**

- [x] `Button.tsx` — variant: primary | secondary | ghost | danger; loading state
- [x] `Badge.tsx` — variant: sale | preorder | soldout | new | coin
- [x] `Input.tsx` — controlled, label, error message
- [x] `Textarea.tsx`
- [x] `Select.tsx`
- [x] `Checkbox.tsx`
- [x] `Modal.tsx` — portal, backdrop, close on Escape/click-outside
- [x] `Drawer.tsx` — slide-in panel (used for cart + mobile menu)
- [x] `Toast.tsx` + `ToastProvider.tsx`
- [x] `Skeleton.tsx` — base shimmer
- [x] `Spinner.tsx`
- [x] `Tabs.tsx`
- [x] `Accordion.tsx`
- [x] `RichTextRenderer.tsx` — DOMPurify-sanitised HTML render
- [x] `StarRating.tsx`

**Layout components**

- [x] `components/layout/Providers.tsx` — wraps AuthProvider, ToastProvider, QueryClientProvider
- [x] `components/layout/Navbar.tsx` — logo, collections mega-menu, search, account, wishlist, cart badge
- [x] `components/layout/NavCollectionsMenu.tsx` — mega-menu from Firestore
- [x] `components/layout/MobileMenu.tsx` — full-screen drawer
- [x] `components/layout/Footer.tsx` — links, social, newsletter from `siteConfig`
- [x] `components/layout/AnnouncementBar.tsx`

**Product components**

- [x] `components/product/ProductCard.tsx` — image hover, sale badge, price, sold-out overlay
- [x] `components/product/ProductCard.skeleton.tsx`
- [x] `components/product/ProductGrid.tsx` — responsive 4→2 col grid
- [x] `components/product/PriceTag.tsx` — sale/regular/sold-out/pre-order states
- [x] `components/product/StockBadge.tsx`
- [x] `components/product/ProductFilterSidebar.tsx` — price, brand, franchise, in-stock
- [x] `components/product/ProductImageGallery.tsx` — thumbnail strip + zoom lightbox
- [x] `components/product/ProductSpecsTable.tsx`

**Cart components**

- [x] `components/cart/CartDrawer.tsx`
- [x] `components/cart/CartItem.tsx`
- [x] `components/cart/CartSummary.tsx`
- [x] `components/cart/EmptyCart.tsx`

**Checkout components**

- [x] `components/checkout/AddressForm.tsx`
- [x] `components/checkout/SavedAddressPicker.tsx`
- [x] `components/checkout/CoinRedeemToggle.tsx`
- [x] `components/checkout/DiscountCodeInput.tsx`
- [x] `components/checkout/OrderSummary.tsx`

**App pages (Phase 1 scope)**

- [x] `app/layout.tsx` — root layout, fonts, global providers
- [x] `app/globals.css` — Tailwind base + CSS variables
- [x] `app/not-found.tsx`
- [x] `app/(storefront)/layout.tsx` — Navbar + Footer + AnnouncementBar
- [x] `app/(storefront)/collections/page.tsx` — all collections grid (ISR 300s)
- [x] `app/(storefront)/collections/[slug]/page.tsx` — product listing with filters (ISR 300s)
- [x] `app/(storefront)/collections/[slug]/loading.tsx`
- [x] `app/(storefront)/products/[slug]/page.tsx` — product detail (ISR 300s)
- [x] `app/(storefront)/products/[slug]/loading.tsx`
- [x] `app/(storefront)/products/[slug]/_components/ImageGallery.tsx`
- [x] `app/(storefront)/products/[slug]/_components/AddToCartSection.tsx`
- [x] `app/(storefront)/products/[slug]/_components/WishlistButton.tsx`
- [x] `app/(storefront)/cart/page.tsx`
- [x] `app/(storefront)/checkout/page.tsx`
- [x] `app/(storefront)/checkout/_components/` (all 5 checkout sub-components)
- [x] `app/(auth)/layout.tsx`
- [x] `app/(auth)/login/page.tsx`
- [x] `app/(auth)/register/page.tsx`
- [x] `app/(auth)/forgot-password/page.tsx`
- [x] `app/api/checkout/route.ts` — POST: validate → write order → reserve stock → return WA URL

**Auth & Middleware**

- [x] `middleware.ts` — protect `/admin/**` and `/account/**` routes

**Phase 1 gate**

- [x] `pnpm typecheck` — 0 errors
- [x] `pnpm lint` — 0 errors
- [x] `pnpm build` — succeeds
- [x] Smoke test: browse `/collections`, open a product, add to cart, complete checkout → lands on `wa.me` link

---

### 12.2 Phase 2 — Core UX

> **Branch:** `phase/2-core-ux`  
> **Commit message:** `feat: Phase 2 — Core UX complete`

**Goal:** Fully dynamic homepage, search, wishlist, account dashboard, responsive nav/footer, skeleton states.

#### Checklist

**Homepage**

- [ ] `app/(storefront)/page.tsx` — ISR 300s, orchestrates all home sections
- [ ] `components/home/HeroBanner.tsx` — carousel from Firestore `banners`
- [ ] `components/home/CollectionStrip.tsx` — franchise tile row
- [ ] `components/home/BrandStrip.tsx` — brand logo scroll
- [ ] `components/home/HomeSection.tsx` — titled product row (featured / bestseller)
- [ ] `components/home/HomeSectionList.tsx`
- [ ] `components/home/PromoGrid.tsx` — 4-tile promo banners
- [ ] `components/home/TestimonialsCarousel.tsx`
- [ ] `components/home/FAQAccordion.tsx`
- [ ] `lib/firebase/content.ts` — `getBanners()`, `getHomeSections()`, `getTestimonials()`, `getFAQ()`, `getAnnouncements()`
- [ ] `hooks/useSiteConfig.ts`

**Search**

- [ ] `app/(storefront)/search/page.tsx` — SSR, `?q=` param, ProductGrid, no-results state
- [ ] `app/(storefront)/search/loading.tsx`
- [ ] Firestore prefix query in `lib/firebase/products.ts#searchProducts()`

**Filters & Sort (collection page)**

- [ ] Full filter panel UX on `/collections/[slug]` — availability, price range, brand, sort
- [ ] URL param sync (`?brand=hot-toys&sort=price_asc&page=2`)

**Wishlist**

- [ ] `app/(storefront)/account/wishlist/page.tsx`
- [ ] Zustand wishlist persist + sync with Firestore on auth

**Account**

- [ ] `app/(storefront)/account/layout.tsx` — sidebar
- [ ] `app/(storefront)/account/page.tsx` — profile + coin balance
- [ ] `app/(storefront)/account/orders/page.tsx` — order list
- [ ] `app/(storefront)/account/addresses/page.tsx`
- [ ] `app/(storefront)/account/orders/[orderId]/page.tsx` — order detail
- [ ] `lib/firebase/users.ts` — `getUser()`, `updateUser()`, `addAddress()`, `removeAddress()`
- [ ] `lib/firebase/orders.ts` — `getUserOrders()`, `getOrder()`
- [ ] `components/account/AccountSidebar.tsx`
- [ ] `components/account/CoinBalanceCard.tsx`
- [ ] `components/account/AddressCard.tsx`
- [ ] `components/order/OrderCard.tsx`
- [ ] `components/order/OrderItemList.tsx`
- [ ] `components/order/OrderStatusBadge.tsx`

**Responsive polish**

- [ ] Mobile nav drawer fully functional
- [ ] Footer responsive (stacked on mobile)
- [ ] Announcement bar auto-rotates
- [ ] Trust badges row in footer + product page
- [ ] Newsletter signup form (writes to Firestore `newsletterSignups/{email}`)

**Phase 2 gate**

- [x] typecheck · lint · build pass
- [ ] Smoke test: homepage loads all sections; search works; wishlist syncs; account shows orders

---

### 12.3 Phase 3 — Order Tracking

> **Branch:** `phase/3-order-tracking`  
> **Commit message:** `feat: Phase 3 — Order Tracking complete`

**Goal:** Real-time order status visible to customers; admin can update status with WA notification.

#### Checklist

- [x] `app/(storefront)/orders/[orderId]/track/page.tsx` — vertical stepper, `onSnapshot`
- [x] `app/(storefront)/orders/[orderId]/track/loading.tsx`
- [x] `components/order/OrderStatusStepper.tsx`
- [x] `components/order/TrackingBanner.tsx`
- [x] `lib/firebase/orders.ts` — `updateOrderStatus()`, `releaseReservedStock()`
- [x] `hooks/useOrderStatusConfig.ts`
- [x] `app/api/admin/orders/[id]/status/route.ts` — PATCH (admin-only)
- [ ] Firestore `orderStatusConfig` seed documents (all 7 statuses)
- [x] Cloud Function stub: `onOrderStatusChange.ts` — dispatches WA notification
- [x] `components/admin/StatusChangeForm.tsx` — status dropdown (valid transitions only), note, AWB, WA preview

**Phase 3 gate**

- [x] typecheck · lint · build pass
- [ ] Smoke test: place order → view `/orders/{id}/track` → update status as admin → customer stepper updates in real time

---

### 12.4 Phase 4 — Inventory via WhatsApp

> **Branch:** `phase/4-inventory-bot`  
> **Commit message:** `feat: Phase 4 — Inventory WhatsApp bot complete`

**Goal:** Admin can manage stock via WhatsApp text commands; passive low-stock alerts fire on product writes.

#### Checklist

- [x] `app/api/webhooks/whatsapp/route.ts` — HMAC verification, command dispatch
- [ ] `lib/whatsapp.ts` — `parseIncomingWebhook()`, `verifyWebhookSignature()`, `isAdminNumber()`, `buildHelpMessage()`
- [x] `lib/inventory.ts` — `parseRestockCommand()`, `parseStatusCommand()`, `buildLowStockAlertMessage()`, `buildSoldOutAlertMessage()`
- [x] Command handlers: RESTOCK, SOLDOUT, PREORDER, STATUS, STOCK, HELP
- [x] `functions/src/onProductWrite.ts` — recalc `availableStock`, alert logic
- [x] `functions/src/onOrderWrite.ts` — coins on delivered, release reserved stock on cancel/deliver
- [x] `functions/src/onUserCoinUpdate.ts` — guard negative balance
- [ ] Admin restock UI in `/admin/products/[id]` (Phase 6 page, but core logic here)
- [ ] Vitest integration test: webhook handler processes RESTOCK command correctly

**Phase 4 gate**

- [x] typecheck · lint · build pass
- [ ] Local webhook test: POST to `/api/webhooks/whatsapp` with valid HMAC + RESTOCK payload → Firestore updated

---

### 12.5 Phase 5 — Content & SEO

> **Branch:** `phase/5-content-seo`  
> **Commit message:** `feat: Phase 5 — Content & SEO complete`

**Goal:** Blog, policy pages, dynamic sitemap, metadata API, OG images, on-demand ISR.

#### Checklist

- [ ] `app/(storefront)/blog/page.tsx` — ISR 3600s, empty-state handling
- [ ] `app/(storefront)/blog/[slug]/page.tsx`
- [ ] `app/(storefront)/blog/[slug]/loading.tsx`
- [ ] `app/(storefront)/policies/[policy]/page.tsx` — ISR 3600s
- [ ] `app/(storefront)/[pageSlug]/page.tsx` — about, contact (ISR 3600s)
- [ ] `components/blog/PostCard.tsx`
- [ ] `components/blog/PostBody.tsx` — DOMPurify sanitised
- [ ] `lib/firebase/content.ts` — `getPage()`, `getBlogPost()`, `getAllBlogPosts()`
- [ ] `lib/seo.ts` — `generateProductMetadata()`, `generateCollectionMetadata()`, `generateBlogMetadata()`, `generateDefaultMetadata()`
- [ ] `app/api/revalidate/route.ts` — POST with secret token
- [ ] `app/api/sitemap/route.ts` — dynamic XML from Firestore slugs
- [ ] `app/sitemap.ts` — Next.js native sitemap (calls sitemap lib)
- [ ] `app/robots.ts` — robots.txt generation
- [ ] `functions/src/scheduledSitemapRebuild.ts` — Cloud Scheduler daily 2am IST

**Phase 5 gate**

- [x] typecheck · lint · build pass
- [ ] Smoke test: `/blog`, `/policies/shipping-policy`, `/about`, `/contact` load correctly; `GET /api/sitemap` returns valid XML

---

### 12.6 Phase 6 — Admin Panel

> **Branch:** `phase/6-admin`  
> **Commit message:** `feat: Phase 6 — Admin Panel complete`

**Goal:** Full admin UI for every Firestore-backed entity.

#### Checklist

- [x] `app/(admin)/layout.tsx` — auth guard (role=admin), sidebar
- [x] `app/(admin)/admin/page.tsx` — dashboard (stats cards, recent orders, low-stock list)
- [x] Products CRUD: list · new · edit · bulk-upload
- [x] Orders: list (filters) · detail (status update, WA notify)
- [x] Collections: list · new · edit · drag-to-reorder
- [x] Content tabs: Banners · Sections · FAQs · Testimonials · Announcements
- [x] Blog: post list · rich-text editor (Tiptap) · publish/unpublish
- [x] Pages editor: terms · privacy · shipping · refund · about · contact
- [x] Loyalty config editor + top holders + manual coin grant
- [x] Discounts: list · new
- [x] Config: `siteConfig` tabbed form
- [x] `app/api/admin/products/bulk-upload/route.ts` — CSV → Firestore batch write
- [x] All admin forms use shared `components/admin/` components
- [x] `components/admin/DraggableList.tsx` — generic drag-to-reorder
- [x] `components/admin/CameraCapture.tsx` — device camera component
  - Image mode: live viewfinder (`getUserMedia`) → capture still → preview → confirm/retake → upload to Firebase Storage → returns Storage URL
  - Video mode: start/stop recording (`MediaRecorder`) → preview → confirm/discard → upload to Firebase Storage → returns Storage URL
  - Graceful fallback: if `getUserMedia` unavailable (non-HTTPS or permissions denied), render `<input type="file" accept="image/*,video/*" capture="environment">` instead
  - Integrated into `ProductForm.tsx` image gallery field and new `videos[]` field
  - Integrated into `InventoryEditForm.tsx` for attaching restock condition photos
- [x] `types/product.ts` — add `videos: string[]` to `Product` type
- [x] `storage.rules` — allow authenticated admins to write to `products/*/videos/**`; enforce 100 MB max size for video objects

**Phase 6 gate**

- [x] typecheck · lint · build pass
- [ ] Smoke test: create product → appears in storefront (after ISR revalidate); update order status from admin → stepper updates for customer

---

### 12.7 Phase 7 — Loyalty & Pre-orders

> **Branch:** `phase/7-loyalty`  
> **Commit message:** `feat: Phase 7 — Loyalty & Pre-orders complete`

**Goal:** FCC Coins earn/redeem, discount code system, pre-order badge and checkout flow.

#### Checklist

- [ ] `lib/loyalty.ts` — `calculateCoinsEarned()`, `calculateMaxRedeemable()`, `applyCoinsToOrder()`
- [ ] `lib/firebase/users.ts` — `awardCoins()`, `redeemCoins()`
- [ ] `lib/firebase/discounts.ts` — `validateDiscount()`, `incrementDiscountUsage()`
- [ ] Coin UI on checkout: `CoinRedeemToggle` fully wired
- [ ] Discount code UI on checkout: `DiscountCodeInput` fully wired
- [ ] Pre-order badge on `ProductCard`, `StockBadge`, product detail CTA
- [ ] Pre-order checkout: WhatsApp message prefixed "PRE-ORDER:"
- [ ] `components/account/CoinBalanceCard.tsx` — balance + history (coin history tab)
- [x] `functions/src/onOrderWrite.ts` — coins awarded on `delivered`
- [x] `functions/src/onUserCoinUpdate.ts` — negative balance guard
- [ ] Firestore `discounts` seed with sample codes
- [ ] Firestore `loyaltyConfig/main` seed

**Phase 7 gate**

- [x] typecheck · lint · build pass
- [ ] Smoke test: add to cart → apply discount → redeem coins → order placed → delivered → coins credited to account

---

## 13. Future Upgrades

| Upgrade                      | Effort | Notes                                                                         |
| ---------------------------- | ------ | ----------------------------------------------------------------------------- |
| **Razorpay payment gateway** | 1 wk   | Replace `/api/checkout` redirect target; order model stays identical          |
| **No-cost EMI**              | 3 days | Razorpay config param; show EMI calculator on product page                    |
| **Algolia search**           | 1 wk   | Mirror `products` collection to Algolia via Cloud Function; swap search route |
| **Push notifications**       | 3 days | Firebase Cloud Messaging for order status (replaces / augments WA notify)     |
| **Mobile app**               | —      | React Native + Expo; all Firebase lib functions are reusable                  |
| **B2B / bulk orders**        | 1 wk   | Separate order type, custom pricing tier field on users                       |
| **Multi-currency**           | 1 wk   | `siteConfig.currencies[]` + exchange rate field; display-only for now         |
| **Wishlist share**           | 2 days | Generate shareable link with wishlist snapshot                                |

---

_Document version: 1.2 — March 2026_
_All dynamic content fields editable by admin without code deployment._

