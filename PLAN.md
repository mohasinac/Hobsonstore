# Hobson Collectibles — Full Platform Plan

> **Stack:** Next.js 16.1.1 (App Router) · Firebase **Spark** (Firestore, Auth, Storage — free tier, **no Cloud Functions**) · Vercel (hosting + cron jobs) · WhatsApp (checkout + inventory bot) · Zustand · Tailwind CSS · **next-intl** (i18n — en + hi)
> **Deployment:** Firebase Spark + Vercel Hobby — all background logic runs as Next.js API routes or Vercel cron jobs. No Blaze upgrade required.
> **Package manager:** npm · **Payment (Phase 1):** WhatsApp-message-based · **Payment (Phase 8):** Razorpay + COD

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
   - 8.5 [Loyalty — HC Coins](#85-loyalty--hc-coins)
   - 8.6 [Pre-orders](#86-pre-orders)
   - 8.7 [Admin Panel](#87-admin-panel)
   - 8.8 [Blog & Content Pages](#88-blog--content-pages)
9. [API Routes](#9-api-routes)
10. [Background Jobs — Spark-plan replacements for Cloud Functions](#10-background-jobs)
11. [Security Design](#11-security-design)
12. [Phased Implementation Plan](#12-phased-implementation-plan)
    - 12.1 [Phase 1 — Foundation](#121-phase-1--foundation)
    - 12.2 [Phase 2 — Core UX](#122-phase-2--core-ux)
    - 12.3 [Phase 3 — Order Tracking](#123-phase-3--order-tracking)
    - 12.4 [Phase 4 — Inventory via WhatsApp](#124-phase-4--inventory-via-whatsapp)
    - 12.5 [Phase 5 — Content & SEO](#125-phase-5--content--seo)
    - 12.6 [Phase 6 — Admin Panel](#126-phase-6--admin-panel)
    - 12.7 [Phase 7 — Loyalty & Pre-orders](#127-phase-7--loyalty--pre-orders)
    - 12.8 [Phase 8 — Franchise/Brand Restructure & Platform Completion](#128-phase-8--franchisebrand-restructure--platform-completion)
    - 12.9 [Phase 9 — Testing](#129-phase-9--testing)
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
# Install dependencies
npm install

# Start dev server (Next.js)
npm run dev                 # http://localhost:3000

# Start Firebase emulators (Auth, Firestore, Storage)
npm run emulators           # alias for: firebase emulators:start

# Type-check
npm run typecheck           # tsc --noEmit

# Lint
npm run lint                # next lint

# Build (production)
npm run build

# Seed Firestore with sample data (admin-auth required at /seed)
npm run dev                 # then navigate to /seed

# Deploy to Vercel
vercel --prod
```

`package.json` scripts section:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "emulators": "firebase emulators:start --import=./emulator-data --export-on-exit"
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
| Error handling | Use `try/catch` with typed errors at API route boundaries only (no Cloud Functions — Spark tier)                                   |

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

Hobson Collectibles is a premium collectibles e-commerce store operating in India with two physical outlets (Pune, Bengaluru). The platform sells licensed action figures, statues, and pop-culture collectibles across 20+ franchise categories and 20+ brand collections, ranging from ₹1,699 to ₹1,78,999+.

### Business Characteristics

| Property           | Value                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Currency           | INR (₹)                                                                                        |
| Primary categories | Franchise (TMNT, Marvel, DC, Star Wars, etc.) + Brand (Hot Toys, Sideshow, Iron Studios, etc.) |
| Order type         | In-stock + Pre-order                                                                           |
| Payment (Phase 1)  | WhatsApp message → owner manual confirmation                                                   |
| Payment (Phase 2)  | Razorpay (no-cost EMI above ₹6,000)                                                            |
| Loyalty            | HC Coins — earn on purchase, redeem on next order                                              |
| Shipping           | Free pan-India                                                                                 |
| Support            | WhatsApp + Phone, Mon–Fri 11am–8pm IST                                                         |
| Admin contacts     | Customer Care: +91 7620783819 · Statues: +91 7887888187                                        |

---

## 2. As-Crawled Site Map

Every page below was directly crawled from the reference site and adapted for Hobson Collectibles (`hobsoncollectibles.in`). Our build replicates each one 1:1 using the Next.js route and content elements listed.

---

### 2.1 All Pages & URLs

#### `/` — Homepage

**Next.js route:** `app/(storefront)/page.tsx`

| Section                    | Real Content                                                                                                                                                                             | Implementation                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Announcement bar           | Rotating 2 messages: "NO COST EMI ON ORDERS ABOVE ₹6000" + "HOBSON Bengaluru Store Now Open!"                                                                                           | `AnnouncementBar` ← Firestore `announcements`                |
| Hero carousel              | 4–5 slides (images + CTAs — Browse INART Collection, etc.)                                                                                                                               | `HeroBanner` ← Firestore `banners`                           |
| Franchise collection strip | TMNT, DC Comics, Marvel, Transformers, G.I. Joe, Star Wars, MOTU, One Piece, Demon Slayer, Naruto, DBZ, Attack on Titan, JJK, + more                                                     | `CollectionStrip` ← Firestore `collections` (type=franchise) |
| Brand logo strip           | Prime 1 Studios, Sideshow, Iron Studios, McFarlane, First 4 Figures, Super7, Funko, Threezero, NECA, Mezco, Diamond, Storm, Tsume, Infinity Studios, Kotobukiya, Hot Toys, INART, + more | `BrandStrip` ← Firestore `collections` (type=brand)          |
| Featured collection row    | "Featured collection" title + horizontal product carousel with "View all" link                                                                                                           | `HomeSection` ← Firestore `homeSections` (type=featured)     |
| Bestsellers row            | "POPULARS — CHECK THE BESTSELLERS" + product carousel                                                                                                                                    | `HomeSection` ← Firestore `homeSections` (type=bestseller)   |
| Mid-page promo banners     | 4 inline banners: Tintin, Harry Potter, Puzzles, Black Panther (each with "Buy Now"/"Explore" CTA)                                                                                       | `PromoGrid` ← Firestore `promobanners`                       |
| Testimonials carousel      | 20+ customer testimonials with name + star rating + text. Scrollable.                                                                                                                    | `TestimonialsCarousel` ← Firestore `testimonials`            |
| FAQ accordion              | 4 questions (shipping time, shipping cost, international shipping, discount code help)                                                                                                   | `FAQAccordion` ← Firestore `faq`                             |
| Trust badge row            | Free Shipping · Customer Service · Earn HC Coins · Secure Payment (RazorPay badge)                                                                                                       | `TrustBadges` ← Firestore `siteConfig.trustBadges[]`         |
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
| Trust badges          | Free Shipping · Customer Service · HC Coins · Secure Payment | Reuses homepage `TrustBadges` component                                                    |
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
| HC Coins toggle  | "Use X coins (save ₹Y)"                                                                        |
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
| HC Coins balance  | Current balance + "View history" link  |
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

[HOBSON COLLECTIBLES logo]  [Collections ▾]  [Search 🔍]  [Account 👤]  [Wishlist ♡]  [Cart 🛒 (count)]

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
  Free Shipping (pan-India)  ·  Customer Service (Mon–Fri)  ·  Earn HC Coins  ·  Secure Payment (RazorPay)

[4-column footer grid]
  Our Info                Shop              Store Policies          Contact
  ────────────────────    ──────────────    ────────────────────    ──────────────────────────────
  Home                    My Account        Terms & Conditions      Email: hobsoncollectibles.in@gmail.com
  Search                  My Wishlist       Privacy Policy          Customer Care WA: +91 7620783819
  Blog                    My Orders         Shipping Policy         Customer Care Phone: +91 7620783819
  About                   My Addresses      Refund Policy           Statues Queries: +91 7887888187
  Contact Us                                                        PUNE: A-1 GF, Ashiana Park, Koregaon Park - 411001
                                                                    BENGALURU: 1134, 100 Feet Rd, Indiranagar - 560008
                                                                    Support: Mon–Fri 11am–8pm IST

[Newsletter Signup]  Email input + Subscribe button

[Social Links]  Facebook · Instagram · WhatsApp

[Copyright]  © 2026, HOBSON COLLECTIBLES
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
│  Vercel Cron Jobs         │
│  /api/cron/sitemap       │  → daily ISR revalidation (replaces Cloud Scheduler)
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
hobson/                                   # Monorepo root
├── app/                                  # Next.js App Router root
├── components/
├── constants/
├── lib/
├── hooks/
├── types/
├── store/
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
├── layout.tsx                            # Root pass-through — returns children only
├── globals.css                           # Tailwind base + custom CSS variables
├── not-found.tsx                         # Global 404 page
├── robots.ts                             # /robots.txt
├── sitemap.ts                            # Dynamic XML sitemap (deferred to API route)
├── favicon.ico
│
├── [locale]/                             # i18n: all user-facing routes under locale prefix
│   ├── layout.tsx                        # <html lang> + fonts + NextIntlClientProvider
│   │                                     # + Providers (Auth, Cart, Toast)
│   │                                     # generateStaticParams() → ["en", "hi"]
│   │
│   ├── (storefront)/                     # Route group: public storefront
│   │   ├── layout.tsx                    # Navbar + Footer + AnnouncementBar + CartProvider
│   │   │
│   │   ├── page.tsx                      # / — Homepage (ISR revalidate: 300)
│   │   │                                 # Sections (all dynamic from Firestore):
│   │   │                                 #   AnnouncementBar (announcements)
│   │   │                                 #   HeroBanner carousel (banners)
│   │   │                                 #   CollectionStrip — franchise (collections type=franchise)
│   │   │                                 #   BrandStrip — brand logos (collections type=brand)
│   │   │                                 #   HomeSections[] — featured + bestsellers (homeSections)
│   │   │                                 #   PromoGrid — 4 inline banners (promobanners)
│   │   │                                 #   TestimonialsCarousel (testimonials)
│   │   │                                 #   FAQAccordion (faq)
│   │   │                                 #   TrustBadges (siteConfig.trustBadges)
│   │   │                                 #   NewsletterSignup
│   │   │
│   │   ├── collections/
│   │   │   ├── page.tsx                  # /collections — All collections index (ISR 300s)
│   │   │   │                             # Alphabetical grid of all collection tiles (paginated)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx              # /collections/[slug] — Product grid (ISR 300s)
│   │   │       │                         # Reads: collection banner, title, description,
│   │   │       │                         # product count, filter/sort, product grid, pagination
│   │   │       └── loading.tsx           # Skeleton: banner shimmer + product grid skeleton
│   │   │
│   │   ├── products/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx              # /products/[slug] — Product detail (ISR 300s)
│   │   │       │                         # Sections: image gallery (up to 20 imgs + zoom),
│   │   │       │                         # brand link, title, PriceTag, description, ETA,
│   │   │       │                         # qty stepper, wishlist btn, add-to-cart/pre-order CTA,
│   │   │       │                         # buy-it-now CTA, TrustBadges
│   │   │       ├── loading.tsx           # Skeleton: gallery + detail shimmer
│   │   │       └── _components/
│   │   │           ├── ImageGallery.tsx  # Client: thumbnail filmstrip + main image + zoom modal
│   │   │           ├── AddToCartSection.tsx # Client island: qty stepper + add to cart + buy now
│   │   │           ├── WishlistButton.tsx   # Client island: heart toggle → Zustand wishlist
│   │   │           └── RelatedProducts.tsx  # Server: products from same franchise/brand
│   │   │
│   │   ├── search/
│   │   │   ├── page.tsx                  # /search — Full-text search results (SSR, no cache)
│   │   │   │                             # ?q= query param → Firestore prefix query
│   │   │   │                             # Same ProductGrid + filter/sort as collection page
│   │   │   └── loading.tsx
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx                  # /cart — Cart page
│   │   │                                 # Empty state: "Your cart is empty" + "Continue shopping"
│   │   │                                 # Populated: line items, qty stepper, remove, subtotal,
│   │   │                                 # "Check Out" → /checkout
│   │   │
│   │   ├── checkout/
│   │   │   ├── page.tsx                  # /checkout — WhatsApp checkout
│   │   │   └── _components/
│   │   │       ├── AddressForm.tsx       # Name, phone, line1, line2, city, state, pincode
│   │   │       ├── SavedAddressPicker.tsx # Select from account addresses (logged-in users)
│   │   │       ├── CoinRedeemToggle.tsx  # "Use X coins (save ₹Y)" toggle
│   │   │       ├── DiscountCodeInput.tsx # Code input + validate against Firestore discounts
│   │   │       └── OrderSummary.tsx      # Readonly: items, subtotal, discount, coins, total
│   │   │
│   │   ├── orders/
│   │   │   └── [orderId]/
│   │   │       └── track/
│   │   │           ├── page.tsx          # /orders/[id]/track — Order tracking
│   │   │           │                     # Vertical status stepper, real-time via onSnapshot,
│   │   │           │                     # courier + tracking link when status ≥ shipped
│   │   │           └── loading.tsx
│   │   │
│   │   ├── account/
│   │   │   ├── layout.tsx                # Account sidebar: Profile · Orders · Wishlist · Addresses
│   │   │   ├── page.tsx                  # /account — Profile info + HC coin balance + quick links
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx              # /account/orders — Order list (ID, date, total, status, Track)
│   │   │   │   └── [orderId]/
│   │   │   │       └── page.tsx          # /account/orders/[id] — Line items, totals, address, timeline
│   │   │   ├── wishlist/
│   │   │   │   └── page.tsx              # /account/wishlist — Product grid from users.wishlist[]
│   │   │   └── addresses/
│   │   │       └── page.tsx              # /account/addresses — Cards: Add/Edit/Delete/Set default
│   │   │
│   │   ├── blog/
│   │   │   ├── page.tsx                  # /blog — Post index grid (ISR 3600s)
│   │   │   │                             # Empty state: "No posts yet" until admin publishes
│   │   │   └── [slug]/
│   │   │       ├── page.tsx              # /blog/[slug] — Post: cover, title, author, date, body
│   │   │       └── loading.tsx
│   │   │
│   │   ├── policies/
│   │   │   └── [policy]/
│   │   │       └── page.tsx              # /policies/[policy] — Policy pages (ISR 3600s)
│   │   │                                 # Slugs: terms-of-service · privacy-policy ·
│   │   │                                 #        shipping-policy · refund-policy
│   │   │                                 # Content from Firestore `pages/{policy}`
│   │   │
│   │   └── [pageSlug]/
│   │       └── page.tsx                  # /about, /contact — Info pages (ISR 3600s)
│   │                                     # about: company history, authorised distributors list
│   │                                     # contact: contact form (Name/Email/Message) + store info
│   │
│   ├── (auth)/                           # Route group: auth screens (no Navbar/Footer)
│   │   ├── layout.tsx                    # Centered card layout
│   │   ├── login/
│   │   │   └── page.tsx                  # /login — Email + Password + Google OAuth
│   │   ├── register/
│   │   │   └── page.tsx                  # /register — Name + Email + Password + Google
│   │   └── forgot-password/
│   │       └── page.tsx                  # /forgot-password — Email input → Firebase reset email
│   │
│   └── (admin)/                          # Route group: admin panel (auth-gated in layout)
│       ├── layout.tsx                    # Admin shell: sidebar nav + session check
│       │
│       └── admin/
│           ├── page.tsx                  # /admin — Dashboard: stats, recent orders, low-stock
│           │
│           ├── products/
│           │   ├── page.tsx              # /admin/products — List, search, quick-stock edit
│           │   ├── new/
│           │   │   └── page.tsx          # /admin/products/new — Create product form
│           │   ├── [id]/
│           │   │   └── page.tsx          # /admin/products/[id] — Edit product
│           │   └── bulk-upload/
│           │       └── page.tsx          # /admin/products/bulk-upload — CSV upload UI
│           │
│           ├── orders/
│           │   ├── page.tsx              # /admin/orders — List, filter by status/date
│           │   └── [id]/
│           │       └── page.tsx          # /admin/orders/[id] — Detail + status change + WA notify
│           │
│           ├── collections/
│           │   ├── page.tsx              # /admin/collections — List, reorder drag-and-drop
│           │   ├── new/
│           │   │   └── page.tsx
│           │   └── [slug]/
│           │       └── page.tsx
│           │
│           ├── content/
│           │   ├── page.tsx              # /admin/content — Tabs: Banners, Sections, FAQs, Testimonials
│           │   ├── banners/
│           │   │   └── page.tsx
│           │   ├── home-sections/
│           │   │   └── page.tsx
│           │   ├── testimonials/
│           │   │   └── page.tsx
│           │   ├── faq/
│           │   │   └── page.tsx
│           │   └── announcements/
│           │       └── page.tsx
│           │
│           ├── blog/
│           │   ├── page.tsx              # /admin/blog — Post list
│           │   ├── new/
│           │   │   └── page.tsx
│           │   └── [id]/
│           │       └── page.tsx          # Rich-text editor
│           │
│           ├── pages/
│           │   └── [slug]/
│           │       └── page.tsx          # /admin/pages/[slug] — Edit policy/info page body
│           │
│           ├── loyalty/
│           │   └── page.tsx              # /admin/loyalty — Config editor + top holders + manual grant
│           │
│           ├── discounts/
│           │   ├── page.tsx              # /admin/discounts — Code list
│           │   └── new/
│           │       └── page.tsx
│           │
│           └── config/
│               └── page.tsx              # /admin/config — siteConfig editor (WA numbers, SEO, support hours)
│
├── api/                                  # API routes (not locale-scoped)
│   ├── checkout/
│   │   └── route.ts                      # POST: validate → write order → reserve stock → return WA URL
│   ├── webhooks/
│   │   └── whatsapp/
│   │       └── route.ts                  # POST: inbound WA bot (HMAC verified)
│   ├── admin/
│   │   ├── seed/
│   │   │   └── route.ts                  # POST/DELETE: admin-auth seed/delete entities
│   │   ├── orders/
│   │   │   └── [id]/
│   │   │       └── status/
│   │   │           └── route.ts          # PATCH: update order status (admin only)
│   │   └── products/
│   │       └── bulk-upload/
│   │           └── route.ts              # POST: CSV → Firestore batch write
│   ├── revalidate/
│   │   └── route.ts                      # POST: on-demand ISR revalidation (secret-token auth)
│   └── sitemap/
│       └── route.ts                      # GET: dynamic XML sitemap
│
└── seed/                                 # Admin-only seed UI (auth-gated by layout)
    ├── layout.tsx                        # Firebase auth check: role === "admin"
    └── page.tsx                          # Live DB counts, entity groups, seed/delete UI
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

> **Note — Firebase Spark Plan:** Cloud Functions require the Blaze (pay-as-you-go) plan. This project runs on Spark (free tier). All logic that would have been Cloud Functions is instead handled inline at the API route call site or via Vercel cron jobs. See §10 for the full mapping.

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
  franchise: string;              // slug from `franchises` collection — e.g. "marvel"
  brand: string;                  // slug from `brands` collection — e.g. "hot-toys"
  tags: string[];                 // e.g. ["sixth-scale", "deluxe"]
  description: string;            // rich text / HTML
  specs: Record<string, string>;  // e.g. { Scale: "1:6", Material: "Die-cast" }
  stock: number;
  reservedStock: number;          // units in pending/confirmed orders
  availableStock: number;         // API route keeps in sync: stock - reservedStock (updated on every stock mutation)
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
  hcCoins: number;
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

### `franchises/{slug}` _(was `type: "franchise"` inside `collections`)_

```ts
{
  slug: string;
  name: string;
  thumbnailImage?: string;     // for FranchiseStrip nav tile + /franchise index grid
  bannerImage?: string;        // for /franchise/[slug] page header
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  active: boolean;
}
```

### `brands/{slug}` _(was `type: "brand"` inside `collections`)_

```ts
{
  slug: string;
  name: string;
  logoImage?: string;          // for BrandStrip horizontal scroll
  bannerImage?: string;        // for /brand/[slug] page header
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  active: boolean;
}
```

### `collections/{slug}` _(curated/featured groupings only — What's New, 1/6 Scale, Action Figures, etc.)_

```ts
{
  slug: string;
  name: string;
  bannerImage?: string;
  description?: string;
  // auto-filter rules (any matching product is included)
  filterFranchises?: string[];  // franchise slugs
  filterBrands?: string[];      // brand slugs
  filterTags?: string[];        // product tags
  manualProductIds?: string[];  // OR handpick specific products
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

### `reviews/{id}`

```ts
{
  id: string;
  productId: string;
  productSlug: string;
  userId: string;
  userName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
  images?: string[];            // Firebase Storage URLs (optional photo proof, max 3)
  status: "pending" | "approved" | "rejected";
  adminReply?: string;
  flagCount: number;
  isVerifiedPurchase: boolean;  // true if userId has an order containing productId
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `reviewFlags/{id}`

```ts
{
  reviewId: string;
  userId: string;
  reason: "spam" | "offensive" | "fake" | "other";
  createdAt: Timestamp;
}
```

### `supportTickets/{id}`

```ts
{
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId?: string;             // linked order if issue is order-related
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  messages: {
    senderUid: string;
    senderName: string;
    senderRole: "customer" | "admin";
    body: string;
    createdAt: Timestamp;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
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

### 6.1 Composite Indices

Firestore only auto-builds single-field indexes. A composite index is required whenever:
- An **equality filter** is combined with **orderBy on a different field**, or
- There are **two or more equality/range filters** on different fields.

All composite indices live in `firestore.indexes.json` and are deployed via `firebase deploy --only firestore:indexes`.

#### Strategy — Products sort covers

`getProducts()` (client) and `getProductsServer()` (server) support four sort options for each filter combination. Every equality filter that can be applied on the storefront must be covered by indices for all four sorts:

| Sort option | Sort field + direction |
|-------------|----------------------|
| `newest` (default) | `createdAt DESC` |
| `price_asc` | `salePrice ASC` |
| `price_desc` | `salePrice DESC` |
| `az` | `name ASC` |

#### `products` — required composite indices

| Filter fields | Sort field | Notes |
|---|---|---|
| `active` | `salePrice ASC` | server active-only sort |
| `active` | `salePrice DESC` | server active-only sort |
| `active` | `createdAt DESC` | new arrivals / default |
| `active` | `name ASC` | name sort + prefix-search (`active == true, name >= q`) |
| `active, franchise` | `createdAt DESC` | franchise page — newest |
| `active, franchise` | `salePrice ASC` | franchise page — price ↑ |
| `active, franchise` | `salePrice DESC` | franchise page — price ↓ |
| `active, franchise` | `name ASC` | franchise page — A–Z |
| `active, brand` | `createdAt DESC` | brand page — newest |
| `active, brand` | `salePrice ASC` | brand page — price ↑ |
| `active, brand` | `salePrice DESC` | brand page — price ↓ |
| `active, brand` | `name ASC` | brand page — A–Z |
| `active, inStock` | `createdAt DESC` | in-stock filter — newest |
| `active, inStock` | `salePrice ASC` | in-stock filter — price ↑ |
| `active, inStock` | `salePrice DESC` | in-stock filter — price ↓ |
| `active, inStock` | `name ASC` | in-stock filter — A–Z |
| `active, isFeatured` | _(no orderBy)_ | homepage featured products |
| `active, isBestseller` | _(no orderBy)_ | homepage bestsellers |
| `active, isPreorder` | `createdAt DESC` | preorder listing |
| `franchise, active, inStock` | _(no orderBy)_ | related products (`getRelatedProductsServer`) |
| `franchise` (no active) | `createdAt DESC` | client `getProducts()` without active filter |
| `franchise` (no active) | `salePrice ASC` | client franchise sort |
| `franchise` (no active) | `salePrice DESC` | client franchise sort |
| `franchise` (no active) | `name ASC` | client franchise sort |
| `brand` (no active) | `createdAt DESC` | client brand sort |
| `brand` (no active) | `salePrice ASC` | client brand sort |
| `brand` (no active) | `salePrice DESC` | client brand sort |
| `brand` (no active) | `name ASC` | client brand sort |
| `inStock` (no active) | `createdAt DESC` | client in-stock sort |
| `inStock` (no active) | `salePrice ASC` | client in-stock sort |
| `inStock` (no active) | `salePrice DESC` | client in-stock sort |

#### `orders` — required composite indices

| Filter fields | Sort field | Notes |
|---|---|---|
| `userId` | `createdAt DESC` | customer order history |
| `currentStatus` | `createdAt DESC` | admin order list by status |

#### Content collections — `active + sortOrder` pattern

All content collections (`banners`, `promobanners`, `homeSections`, `faq`, `announcements`) use the same query pattern: `where("active","==",true).orderBy("sortOrder","asc")`. Each needs its own index.

`testimonials` additionally has a `featured` filter: `where("featured","==",true).where("active","==",true).orderBy("sortOrder","asc")` → needs three-field index.

#### `blog` — required composite indices

| Filter fields | Sort field | Notes |
|---|---|---|
| `published` | `publishedAt DESC` | public blog listing |
| `slug, published` | _(no orderBy)_ | `getBlogPost(slug)` lookup — two equality filters |

#### `reviews` — Phase 8 (add before Phase 8 deploy)

| Filter fields | Sort field | Notes |
|---|---|---|
| `productId, status` | `createdAt DESC` | approved reviews on product page |
| `userId, status` | `createdAt DESC` | account reviews history |
| `status` | `createdAt DESC` | admin moderation queue |
| `reviewId` | `createdAt DESC` | flags per review |

#### `supportTickets` — Phase 6+

| Filter fields | Sort field | Notes |
|---|---|---|
| `userId` | `createdAt DESC` | customer own tickets |
| `status` | `updatedAt DESC` | admin queue by status |
| `userId, status` | `createdAt DESC` | customer tickets filtered by status |

#### Stale indices to remove

The following entries in `firestore.indexes.json` use fields that no longer exist in the current schema and must be removed to avoid confusion:

| Stale fields | Reason |
|---|---|
| `collectionId` | Removed — curated collections now use `filterFranchises/filterBrands/filterTags` on the `collections` document, not a denormalized product field |
| `collections ARRAY_CONTAINS` | Removed — products no longer carry a `collections[]` array |
| `status` (products) | Renamed to `active: boolean` |
| `price` (products) | Renamed to `salePrice` |
| `nameLower` | Removed — prefix search uses `name >= q` directly |

---

## 7. Constants & DRY Design

### `constants/firebase.ts`

```ts
export const COLLECTIONS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  USERS: "users",
  FRANCHISES: "franchises",            // taxonomy: franchise IPs (Marvel, DC, TMNT…)
  BRANDS: "brands",                    // taxonomy: manufacturer brands (Hot Toys, Sideshow…)
  CURATED_COLLECTIONS: "collections",  // curated groupings (What's New, 1/6 Scale…)
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
  REVIEWS: "reviews",
  REVIEW_FLAGS: "reviewFlags",
  SUPPORT_TICKETS: "supportTickets",
  NEWSLETTER: "newsletter",
  PAYMENT_SETTINGS: "paymentSettings",
  SHIPPING_SETTINGS: "shippingSettings",
  NAVIGATION_CONFIG: "navigationConfig",
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
  ACCOUNT_SUPPORT: "/account/support",
  FRANCHISE: (slug: string) => `/franchise/${slug}`,
  BRAND: (slug: string) => `/brand/${slug}`,
  COLLECTION: (slug: string) => `/collections/${slug}`,
  PRODUCT: (slug: string) => `/products/${slug}`,
  ORDER_TRACK: (id: string) => `/orders/${id}/track`,
  ORDER_DETAIL: (id: string) => `/account/orders/${id}`,
  PAGE: (slug: string) => `/${slug}`,
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_FRANCHISES: "/admin/franchises",
  ADMIN_BRANDS: "/admin/brands",
  ADMIN_COLLECTIONS: "/admin/collections",
  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_SUPPORT: "/admin/support",
  ADMIN_NEWSLETTER: "/admin/newsletter",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_CONTENT: "/admin/content",
  ADMIN_CONFIG: "/admin/config",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_SETTINGS_PAYMENTS: "/admin/settings/payments",
  ADMIN_SETTINGS_SHIPPING: "/admin/settings/shipping",
  ADMIN_SETTINGS_NAVIGATION: "/admin/settings/navigation",
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
    "Hi Hobson! I'd like to place an order:",
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
  → Checkout page (address form + HC coins toggle + discount code)
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

#### Passive Alerts (API route inline → Admin WA)

Triggered inside the same API route that mutates stock (RESTOCK/SOLDOUT webhook handler + admin product update route):

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

### 8.5 Loyalty — HC Coins

- Earn rate and redemption rate stored in Firestore `loyaltyConfig/main` — admin changes without deploy.
- Coins earned on `delivered` status — awarded inline inside `PATCH /api/admin/orders/[id]/status` when status transitions to `delivered`.
- Coins redeemable at checkout up to `maxRedeemPercent` of order total.
- Negative balance guard enforced inside `lib/firebase/users.ts#awardCoins()` and `redeemCoins()` (server-only, never client-callable).
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

## 10. Background Jobs

> **Firebase Spark plan — no Cloud Functions.** All background logic runs inline in Next.js API routes (called server-side) or as Vercel cron jobs. The table below maps each "would-be" Cloud Function to its replacement.

| Was Cloud Function        | Spark-plan replacement                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| `onProductWrite`          | Inline in `PATCH /api/admin/products/[id]` and `POST /api/webhooks/whatsapp` after any stock mutation     |
| `onOrderWrite` (coins)    | Inline in `PATCH /api/admin/orders/[id]/status` when status → `delivered`                                 |
| `onOrderWrite` (stock)    | Inline in same route when status → `delivered` or `cancelled` (calls `releaseReservedStock()`)            |
| `onOrderStatusChange`     | Inline in `PATCH /api/admin/orders/[id]/status` — builds WA notify URL + sends Resend email after write   |
| `onUserCoinUpdate`        | Guard inside `lib/firebase/users.ts#awardCoins()` + `redeemCoins()` — server-only functions               |
| `scheduledSitemapRebuild` | Vercel cron job: `GET /api/cron/sitemap` (daily) defined in `vercel.json` under `"crons"` key             |

```jsonc
// vercel.json — cron configuration
{
  "crons": [
    {
      "path": "/api/cron/sitemap",
      "schedule": "0 20 * * *"   // 8pm UTC = 1:30am IST
    }
  ]
}
```

---

## 11. Security Design

| Concern               | Mitigation                                                                         |
| --------------------- | ---------------------------------------------------------------------------------- |
| Admin routes          | Firestore Security Rules: `role === "admin"` + Next.js middleware session check    |
| WhatsApp webhook      | HMAC-SHA256 signature verification on every request                                |
| WA bot commands       | Only accepted from `siteConfig.whatsappAdminBot` number                            |
| Stock race conditions | Firestore transactions used in `/api/checkout` for `availableStock` decrement      |
| Coin balance          | Guard enforced in `lib/firebase/users.ts` server-only functions; never client-callable |
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

- [x] `npx create-next-app@latest hobson --typescript --tailwind --eslint --app`
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

- [x] `app/(storefront)/page.tsx` — ISR 300s, orchestrates all home sections
- [x] `components/home/HeroBanner.tsx` — carousel from Firestore `banners`
- [x] `components/home/CollectionStrip.tsx` — franchise tile row
- [x] `components/home/BrandStrip.tsx` — brand logo scroll
- [x] `components/home/HomeSection.tsx` — titled product row (featured / bestseller)
- [x] `components/home/HomeSectionList.tsx`
- [x] `components/home/PromoGrid.tsx` — 4-tile promo banners
- [x] `components/home/TestimonialsCarousel.tsx`
- [x] `components/home/FAQAccordion.tsx`
- [x] `lib/firebase/content.ts` — `getBanners()`, `getHomeSections()`, `getTestimonials()`, `getFAQ()`, `getAnnouncements()`
- [x] `hooks/useSiteConfig.ts`

**Search**

- [x] `app/(storefront)/search/page.tsx` — SSR, `?q=` param, ProductGrid, no-results state
- [x] `app/(storefront)/search/loading.tsx`
- [x] Firestore prefix query in `lib/firebase/products.ts#searchProducts()`

**Filters & Sort (collection page)**

- [x] Full filter panel UX on `/collections/[slug]` — availability, price range, brand, sort
- [x] URL param sync (`?brand=hot-toys&sort=price_asc&page=2`)

**Wishlist**

- [x] `app/(storefront)/account/wishlist/page.tsx`
- [x] Zustand wishlist persist (localStorage); no Firestore sync needed on Spark plan

**Account**

- [x] `app/(storefront)/account/layout.tsx` — sidebar
- [x] `app/(storefront)/account/page.tsx` — profile + coin balance
- [x] `app/(storefront)/account/orders/page.tsx` — order list
- [x] `app/(storefront)/account/addresses/page.tsx`
- [x] `app/(storefront)/account/orders/[orderId]/page.tsx` — order detail
- [x] `lib/firebase/users.ts` — `getUser()`, `updateUser()`, `addAddress()`, `removeAddress()`
- [x] `lib/firebase/orders.ts` — `getUserOrders()`, `getOrder()`
- [x] `components/account/AccountSidebar.tsx`
- [x] `components/account/CoinBalanceCard.tsx`
- [x] `components/account/AddressCard.tsx`
- [x] `components/order/OrderCard.tsx`
- [x] `components/order/OrderItemList.tsx`
- [x] `components/order/OrderStatusBadge.tsx`

**Responsive polish**

- [x] Mobile nav drawer fully functional
- [x] Footer responsive (stacked on mobile)
- [x] Announcement bar auto-rotates
- [x] Trust badges row in product page; footer has contact/social links
- [x] Newsletter signup form (writes to Firestore `newsletterSignups/{email}`)

**Phase 2 gate**

- [x] typecheck · lint · build pass
- [x] Smoke test: homepage loads all sections; search works; wishlist syncs; account shows orders

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
- [x] Firestore `orderStatusConfig` seed documents (8 statuses in `scripts/seed-data.ts`)
- [x] `PATCH /api/admin/orders/[id]/status` — after status write: build WA notify URL inline, return it to admin UI (admin clicks to open WhatsApp)
- [x] `components/admin/StatusChangeForm.tsx` — status dropdown (valid transitions only), note, AWB, WA preview

**Phase 3 gate**

- [x] typecheck · lint · build pass
- [x] Smoke test: place order → view `/orders/{id}/track` → update status as admin → customer stepper updates in real time

---

### 12.4 Phase 4 — Inventory via WhatsApp

> **Branch:** `phase/4-inventory-bot`  
> **Commit message:** `feat: Phase 4 — Inventory WhatsApp bot complete`

**Goal:** Admin can manage stock via WhatsApp text commands; passive low-stock alerts fire on product writes.

#### Checklist

- [x] `app/api/webhooks/whatsapp/route.ts` — HMAC verification, command dispatch
- [x] `lib/whatsapp.ts` — `parseIncomingWebhook()`, `verifyWebhookSignature()`, `isAdminNumber()`, `buildHelpMessage()`
- [x] `lib/inventory.ts` — `parseRestockCommand()`, `parseStatusCommand()`, `buildLowStockAlertMessage()`, `buildSoldOutAlertMessage()`
- [x] Command handlers: RESTOCK, SOLDOUT, PREORDER, STATUS, STOCK, HELP
- [x] Inline `availableStock` recalc in `PATCH /api/admin/products/[id]` and `POST /api/webhooks/whatsapp` (Spark plan — no Cloud Functions)
- [x] Inline coin award + stock release in `PATCH /api/admin/orders/[id]/status` (no Cloud Function needed)
- [x] Negative balance guard in `lib/firebase/users.ts` server-only functions
- [x] Admin restock UI in `/admin/products/[id]` via `InventoryEditForm` component
- [x] Vitest integration test: webhook handler processes RESTOCK command correctly (32 tests in `__tests__/`)

**Phase 4 gate**

- [x] typecheck · lint · build pass
- [x] Local webhook test: POST to `/api/webhooks/whatsapp` with valid HMAC + RESTOCK payload → Firestore updated

---

### 12.5 Phase 5 — Content & SEO

> **Branch:** `phase/5-content-seo`  
> **Commit message:** `feat: Phase 5 — Content & SEO complete`

**Goal:** Blog, policy pages, dynamic sitemap, metadata API, OG images, on-demand ISR.

#### Checklist

- [x] `app/(storefront)/blog/page.tsx` — ISR 3600s, empty-state handling
- [x] `app/(storefront)/blog/[slug]/page.tsx`
- [x] `app/(storefront)/blog/[slug]/loading.tsx`
- [x] `app/(storefront)/policies/[policy]/page.tsx` — ISR 3600s
- [x] `app/(storefront)/[pageSlug]/page.tsx` — about, contact (ISR 3600s)
- [x] `components/blog/PostCard.tsx`
- [x] `components/blog/PostBody.tsx` — DOMPurify sanitised
- [x] `lib/firebase/content.ts` — `getPage()`, `getBlogPost()`, `getAllBlogPosts()`
- [x] `lib/seo.ts` — `generateProductMetadata()`, `generateCollectionMetadata()`, `generateBlogMetadata()`, `generateDefaultMetadata()`
- [x] `app/api/revalidate/route.ts` — POST with secret token
- [x] `app/api/sitemap/route.ts` — dynamic XML from Firestore slugs
- [x] `app/sitemap.ts` — Next.js native sitemap (calls sitemap lib)
- [x] `app/robots.ts` — robots.txt generation
- [x] `app/api/cron/sitemap/route.ts` — Vercel cron daily sitemap rebuild (Spark plan, no Cloud Functions)

**Phase 5 gate**

- [x] typecheck · lint · build pass
- [x] Smoke test: `/blog`, `/policies/shipping-policy`, `/about`, `/contact` load correctly; `GET /api/sitemap` returns valid XML

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

**Goal:** HC Coins earn/redeem, discount code system, pre-order badge and checkout flow.

#### Checklist

- [x] `lib/loyalty.ts` — `calculateCoinsEarned()`, `calculateMaxRedeemable()`, `applyCoinsToOrder()`
- [x] `lib/firebase/users.ts` — `awardCoins()`, `redeemCoins()`
- [x] `lib/firebase/discounts.ts` — `validateDiscount()`, `incrementDiscountUsage()`
- [x] Coin UI on checkout: `CoinRedeemToggle` fully wired
- [x] Discount code UI on checkout: `DiscountCodeInput` fully wired
- [x] Pre-order badge on `ProductCard`, `StockBadge`, product detail CTA
- [x] Pre-order checkout: WhatsApp message prefixed "PRE-ORDER:"
- [x] `components/account/CoinBalanceCard.tsx` — balance + history (coin history tab)
- [x] Coin award logic in `PATCH /api/admin/orders/[id]/status` — inline on `delivered` transition (no Cloud Function)
- [x] Negative balance guard in `lib/firebase/users.ts#awardCoins()` + `redeemCoins()`
- [x] Firestore `discounts` seed with sample codes
- [x] Firestore `loyaltyConfig/main` seed

**Phase 7 gate**

- [x] typecheck · lint · build pass
- [ ] Smoke test: add to cart → apply discount → redeem coins → order placed → delivered → coins credited to account

---

---

### 12.8 Phase 8 — Franchise/Brand Restructure & Platform Completion

> **Branch:** `phase/8-platform`
> **Commit message:** `feat: Phase 8 — Platform Completion`

**Goal:** Separate `franchise` and `brand` into dedicated Firestore collections (like `categories`/`concerns` in Licorice). Add review system, support tickets, order returns, Razorpay + COD payment, email notifications (Resend), analytics, and all missing admin/settings pages.

---

#### 8A — Franchise & Brand Refactor

**Schema, constants & types**

- [ ] Create `franchises` Firestore collection (migrate from `collections` type=franchise)
- [ ] Create `brands` Firestore collection (migrate from `collections` type=brand)
- [ ] Repurpose `collections` as curated/featured groupings only (What's New, 1/6 Scale, etc.)
- [ ] Update `constants/firebase.ts` — add `FRANCHISES`, `BRANDS`, `CURATED_COLLECTIONS` (done above)
- [ ] Update `constants/routes.ts` — add `FRANCHISE`, `BRAND` route builders (done above)
- [ ] `types/franchise.ts` — `Franchise` type
- [ ] `types/brand.ts` — `Brand` type
- [ ] Update `types/content.ts` — remove `Collection.type` field; remove `Collection.logoImage` (moved to `Brand`); `Collection` = curated grouping only
- [ ] `scripts/migrate-collections.ts` — one-off: split `collections` docs by `type` into `franchises` + `brands` Firestore collections

**Data layer**

- [ ] `lib/firebase/franchises.ts` — `getAllFranchises()`, `getFranchise()`, `getAllFranchisesAdmin()`, `upsertFranchise()`, `deleteFranchise()`, `updateFranchiseOrder()`
- [ ] `lib/firebase/brands.ts` — `getAllBrands()`, `getBrand()`, `getAllBrandsAdmin()`, `upsertBrand()`, `deleteBrand()`, `updateBrandOrder()`
- [ ] `lib/firebase/server.ts` — add `getAllFranchisesServer()`, `getAllBrandsServer()`; replace `getActiveCollectionsByTypeServer()` usage
- [ ] `lib/firebase/products.ts` — update `getProducts()` filter params: `franchise?: string`, `brand?: string` now query against their respective collections' slugs
- [ ] Firestore composite indexes:
  - `products` by `franchise + inStock + createdAt`
  - `products` by `brand + inStock + createdAt`
  - `franchises` by `active + sortOrder`
  - `brands` by `active + sortOrder`

**Storefront routes**

- [ ] `app/(storefront)/franchise/page.tsx` — all franchises grid (ISR 300s)
- [ ] `app/(storefront)/franchise/[slug]/page.tsx` — products filtered by franchise slug (ISR 300s); same layout as `/collections/[slug]`
- [ ] `app/(storefront)/franchise/[slug]/loading.tsx`
- [ ] `app/(storefront)/brand/page.tsx` — all brands grid with logo images (ISR 300s)
- [ ] `app/(storefront)/brand/[slug]/page.tsx` — products filtered by brand slug (ISR 300s)
- [ ] `app/(storefront)/brand/[slug]/loading.tsx`
- [ ] Update `app/(storefront)/collections/[slug]/page.tsx` — curated collections only; no `type` filter

**Component updates**

- [ ] Update `components/layout/NavCollectionsMenu.tsx` — reads from `franchises` + `brands` separately; removes `type=franchise/brand` filter
- [ ] Rename `components/home/CollectionStrip.tsx` → `FranchiseStrip.tsx`; reads `franchises` collection
- [ ] Update `components/home/BrandStrip.tsx` — reads `brands` collection (unchanged behaviour, new source)
- [ ] Update `components/product/ProductCard.tsx` — franchise/brand links use `ROUTES.FRANCHISE` + `ROUTES.BRAND`
- [ ] Update `components/product/ProductFilterSidebar.tsx` — franchise + brand dropdowns populated from dedicated collections

**Admin routes**

- [ ] `app/(admin)/admin/franchises/page.tsx` — list, drag-to-reorder, activate/deactivate
- [ ] `app/(admin)/admin/franchises/new/page.tsx`
- [ ] `app/(admin)/admin/franchises/[slug]/page.tsx` — edit form
- [ ] `app/(admin)/admin/brands/page.tsx` — list with logo image preview
- [ ] `app/(admin)/admin/brands/new/page.tsx`
- [ ] `app/(admin)/admin/brands/[slug]/page.tsx`
- [ ] `components/admin/FranchiseForm.tsx` — name, slug, thumbnailImage, bannerImage, description, sortOrder, active
- [ ] `components/admin/BrandForm.tsx` — name, slug, logoImage, bannerImage, description, sortOrder, active
- [ ] Update `components/admin/AdminSidebar.tsx` — add Franchises + Brands links; rename Collections → Curated Collections
- [ ] Update `components/admin/ProductForm.tsx` — franchise/brand fields read from `franchises`/`brands` collections; dropdowns not hardcoded

**Phase 8A gate**

- [ ] typecheck · lint · build pass
- [ ] `/franchise/marvel` and `/brand/hot-toys` render correct product grids
- [ ] Navigation mega-menu populates from `franchises` + `brands`
- [ ] Admin can create/edit/reorder franchises and brands independently

---

#### 8B — Product Reviews

- [ ] `types/review.ts` — `Review`, `ReviewFlag`, `ReviewStatus` types
- [ ] `lib/firebase/reviews.ts` — `getProductReviews()`, `submitReview()`, `approveReview()`, `rejectReview()`, `addAdminReply()`, `flagReview()`, `getReviewsAdmin()`; `checkVerifiedPurchase()` — cross-checks `orders` for userId + productId
- [ ] `app/(storefront)/products/[slug]/page.tsx` — add Reviews section (approved reviews + add-review form below product info)
- [ ] `components/product/ReviewsList.tsx` — paginated approved reviews with star filter tabs
- [ ] `components/product/ReviewCard.tsx` — name, rating, date, body, photo thumbnails, verified-purchase badge, admin reply
- [ ] `components/product/AddReviewForm.tsx` — star selector, title input, body textarea, optional photo upload (max 3 images to Firebase Storage)
- [ ] `components/product/ReviewFilters.tsx` — filter by star rating
- [ ] `components/product/ReviewPhotoGallery.tsx` — lightbox for review images (reuses `ImageLightbox` ui component)
- [ ] `app/api/review/route.ts` — POST: submit review (auth required); sets `status: "pending"`; sets `isVerifiedPurchase` via purchase check
- [ ] `app/api/review/flag/route.ts` — POST: write to `reviewFlags`, increment `reviews.flagCount`
- [ ] `app/(admin)/admin/reviews/page.tsx` — moderation queue with Pending / Approved / Rejected tabs; `ReviewModerationCard`
- [ ] `app/(admin)/admin/reviews/[id]/page.tsx` — full review + approve/reject/reply actions
- [ ] `components/admin/ReviewModerationCard.tsx`
- [ ] `app/api/admin/reviews/[id]/route.ts` — PATCH: approve | reject | add reply (admin only)
- [ ] Firestore rule: users can only write their own reviews; only one review per user per product; public reads of approved only
- [ ] Update `constants/routes.ts` — `ADMIN_REVIEWS` (done above)
- [ ] Update `components/admin/AdminSidebar.tsx` — add Reviews link with pending-count badge

---

#### 8C — Customer Support Tickets

- [ ] `types/support.ts` — `SupportTicket`, `TicketMessage`, `TicketStatus` types
- [ ] `lib/firebase/supportTickets.ts` — `createTicket()`, `addMessage()`, `updateTicketStatus()`, `getUserTickets()`, `getAllTicketsAdmin()`
- [ ] `app/(storefront)/account/support/page.tsx` — list customer's own tickets + "New Ticket" button
- [ ] `app/(storefront)/account/support/[ticketId]/page.tsx` — ticket thread via `onSnapshot`; reply input
- [ ] `components/support/TicketCard.tsx` — subject, status badge, last-reply date
- [ ] `components/support/TicketThread.tsx` — message bubble list + reply textarea + send button
- [ ] `app/api/support/tickets/route.ts` — POST: create ticket
- [ ] `app/api/support/tickets/[id]/route.ts` — POST: add message; PATCH: update status
- [ ] `app/(admin)/admin/support/page.tsx` — all tickets, filter by status (Open / In Progress / Resolved / Closed)
- [ ] `app/(admin)/admin/support/[ticketId]/page.tsx` — full thread + resolve/close actions
- [ ] `components/admin/TicketInbox.tsx` — ticket list with unread badge
- [ ] Update `components/account/AccountSidebar.tsx` — add Support link with open-ticket count badge
- [ ] Update `constants/routes.ts` — `ACCOUNT_SUPPORT`, `ADMIN_SUPPORT` (done above)

---

#### 8D — Order Returns & Refunds

- [ ] Update `types/order.ts` — add `returnRequest?: { reason: string; requestedAt: Timestamp; status: "pending" | "approved" | "rejected"; refundAmount?: number; resolvedAt?: Timestamp }`
- [ ] Update `constants/orderStatus.ts` — add `return_requested`, `return_approved`, `refund_initiated` statuses + transitions
- [ ] `app/(storefront)/account/orders/[orderId]/page.tsx` — add "Request Return" button (visible within 7-day window from delivered date)
- [ ] `components/order/ReturnRequestButton.tsx` — opens confirm modal with reason selector
- [ ] `app/api/account/return-request/route.ts` — POST: validate return window + order ownership; write `returnRequest` to order doc
- [ ] `lib/firebase/orders.ts` — `submitReturnRequest()`, `approveReturn()`, `rejectReturn()`
- [ ] `app/(admin)/admin/orders/[id]/page.tsx` — show return request panel when `returnRequest` exists; Approve/Reject buttons + refund amount input
- [ ] `app/api/admin/orders/[id]/refund/route.ts` — POST: mark refund initiated; update order status; trigger `restoreStock`
- [ ] `app/api/admin/orders/[id]/restore-stock/route.ts` — POST: increment `stock` + `availableStock` for each returned item (Firestore transaction)
- [ ] `lib/firebase/products.ts` — add `restoreStock(productId, qty)` function

---

#### 8E — Email Notifications (Resend)

- [ ] `npm install resend`
- [ ] Add `RESEND_API_KEY` + `FROM_EMAIL` to `.env.example`
- [ ] `lib/email/index.ts` — `sendOrderConfirmation()`, `sendOrderStatusUpdate()`, `sendTicketReply()`, `sendReturnApproved()`
- [ ] `lib/email/templates/orderConfirmation.ts` — HTML: order items table, total, delivery address, track link
- [ ] `lib/email/templates/orderStatusUpdate.ts` — HTML: status name, message, tracking link when shipped
- [ ] `lib/email/templates/ticketReply.ts` — HTML: ticket subject, new admin message, link to thread
- [ ] `lib/email/templates/returnApproved.ts` — HTML: refund amount, estimated timeline
- [ ] `app/api/order-confirm/route.ts` — POST: send order confirmation email; idempotent via `emailSent` flag on order
- [ ] Update `app/api/checkout/route.ts` — call `sendOrderConfirmation()` after successful order write
- [ ] Update `app/api/admin/orders/[id]/route.ts` — call `sendOrderStatusUpdate()` on status change
- [ ] Update support ticket API — call `sendTicketReply()` on new admin message

---

#### 8F — Razorpay + COD Payment Methods

- [ ] `npm install razorpay`
- [ ] Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` to `.env.example`
- [ ] Update `types/config.ts` — add `PaymentSettings { razorpayEnabled, codEnabled, whatsappEnabled, codFee }`
- [ ] Add `paymentSettings/main` Firestore document; update `constants/firebase.ts` — `PAYMENT_SETTINGS` (done above)
- [ ] `lib/firebase/config.ts` — add `getPaymentSettings()`, `updatePaymentSettings()`
- [ ] `lib/razorpay.ts` — `createRazorpayOrder()`, `verifyPaymentSignature()` (HMAC-SHA256 using `timingSafeEqual`)
- [ ] Update `app/(storefront)/checkout/page.tsx` — conditional payment method selector based on `paymentSettings`
- [ ] `components/checkout/PaymentOptions.tsx` — radio group: WhatsApp | Razorpay | COD; conditionally rendered per settings
- [ ] Update `app/api/checkout/route.ts` — branch on `paymentMethod`: Razorpay → create Razorpay order + return `razorpayOrderId`; COD → direct order write with `codFee` added; WhatsApp → existing flow
- [ ] `app/api/payment/razorpay/verify/route.ts` — POST: verify Razorpay payment signature; update order status to `payment_confirmed`
- [ ] `app/api/payment/whatsapp/submit-proof/route.ts` — POST: accept proof screenshot (multipart/form-data), upload to Firebase Storage under `payment-proofs/{orderId}`, write `paymentProofUrl` to order
- [ ] `components/checkout/WhatsAppPaymentInstructions.tsx` — UPI ID + QR code + bank details from `paymentSettings`
- [ ] `components/checkout/WhatsAppProofUpload.tsx` — file input → POST to `/api/payment/whatsapp/submit-proof`
- [ ] `components/admin/WhatsAppPaymentConfirm.tsx` — shows proof image in `/admin/orders/[id]`; Confirm / Reject buttons
- [ ] `app/(admin)/admin/settings/payments/page.tsx` — toggle Razorpay / COD / WhatsApp; COD fee; Razorpay key input (masked); UPI/bank details for WhatsApp

---

#### 8G — Admin Analytics Page

- [ ] `npm install recharts`
- [ ] `lib/firebase/analytics.ts` — `getRevenueByMonth()`, `getOrdersByStatus()`, `getTopProducts()`, `getBreakdownByFranchise()`, `getBreakdownByBrand()`, `getPaymentMethodSplit()`
- [ ] `app/(admin)/admin/analytics/page.tsx` — full analytics dashboard:
  - Period selector: 3m / 6m / 12m / 24m
  - Revenue line chart (monthly totals from `orders`)
  - Orders by status donut chart
  - Top 10 products table (by revenue)
  - Franchise breakdown bar chart
  - Brand breakdown bar chart
  - Payment method split pie chart
  - New customers per period
- [ ] `components/admin/AnalyticsCharts.tsx` — Recharts wrappers (LineChart, BarChart, PieChart)
- [ ] `components/admin/AnalyticsRangePicker.tsx` — period selector buttons
- [ ] Update `components/admin/AdminSidebar.tsx` — add Analytics nav link

---

#### 8H — Admin Settings Pages

**Settings hub**

- [ ] `app/(admin)/admin/settings/page.tsx` — redirect to `/admin/settings/payments` (first tab)

**Shipping settings**

- [ ] Update `types/config.ts` — add `ShippingSettings { freeShippingThreshold, gstPercent, codFee, shippingNote }`
- [ ] Add `shippingSettings/main` Firestore document; `constants/firebase.ts` — `SHIPPING_SETTINGS` (done above)
- [ ] `lib/firebase/config.ts` — add `getShippingSettings()`, `updateShippingSettings()`
- [ ] `app/(admin)/admin/settings/shipping/page.tsx` — free shipping threshold, GST %, COD fee, note shown at checkout
- [ ] `components/admin/ShippingSettingsForm.tsx`
- [ ] Update `app/api/checkout/route.ts` — read `shippingSettings` to apply COD fee + GST dynamically

**Navigation settings**

- [ ] Update `types/config.ts` — add `NavigationConfig { featuredFranchises: string[], featuredBrands: string[], maxMegaMenuItems: number }`
- [ ] Add `navigationConfig/main` Firestore document; `constants/firebase.ts` — `NAVIGATION_CONFIG` (done above)
- [ ] `lib/firebase/config.ts` — add `getNavigationConfig()`, `updateNavigationConfig()`
- [ ] `app/(admin)/admin/settings/navigation/page.tsx` — select which franchises/brands appear pinned in mega-menu; drag to reorder
- [ ] `components/admin/NavigationSettingsForm.tsx`
- [ ] Update `components/layout/NavCollectionsMenu.tsx` — reads `navigationConfig` to determine featured items

---

#### 8I — Newsletter Admin Page

- [ ] `lib/firebase/newsletter.ts` — `getAllSubscribers()`, `deleteSubscriber()`, `exportSubscribersCSV()`
- [ ] `app/(admin)/admin/newsletter/page.tsx` — subscriber list (email, subscribed date), delete action, Export CSV button
- [ ] `components/admin/NewsletterSubscriberTable.tsx`
- [ ] Update `components/admin/AdminSidebar.tsx` — add Newsletter link with subscriber count

---

#### 8J — Blog Category Filtering

- [ ] Update `types/content.ts` — add `categories: string[]` to `BlogPost`
- [ ] Update `lib/firebase/content.ts` — `getAllBlogPosts(category?: string)` with optional category filter
- [ ] Update `app/(storefront)/blog/page.tsx` — add category tab bar (News · Reviews · Unboxing · Custom Builds · Guides)
- [ ] Update `components/blog/PostCard.tsx` — show category tag chip
- [ ] Add `blogCategories: string[]` to `siteConfig/main` schema (admin-managed list)
- [ ] Update `components/admin/SiteConfigForm.tsx` — add blog categories tag input

---

#### 8K — Checkout State Persistence

- [ ] `store/checkoutStore.ts` — `step`, `address`, `paymentMethod`, `discountCode`, `discountAmount`, `coinsRedeemed`, `orderId` — persisted `hobson-checkout`; clear on order success
- [ ] `hooks/useCheckout.ts` — wraps `checkoutStore`
- [ ] Update `app/(storefront)/checkout/page.tsx` — read/write checkout store; restore multi-step state on page refresh

---

**Phase 8 gate**

- [ ] typecheck · lint · build pass
- [ ] `/franchise/marvel` and `/brand/hot-toys` render correct product grids
- [ ] Product detail shows review list + add-review form; admin can moderate
- [ ] Support ticket creation → real-time thread works end-to-end
- [ ] Return request submits; admin can approve and restore stock
- [ ] Razorpay checkout flow verifies signature and confirms order
- [ ] Order confirmation email received on test order (Resend)
- [ ] Analytics page shows correct revenue totals
- [ ] Payment / Shipping / Navigation settings pages save and apply correctly

---

### 12.9 Phase 9 — Testing

> **Branch:** `phase/9-tests`
> **Commit message:** `feat: Phase 9 — Testing`

**Goal:** Full unit, integration, and E2E test coverage for all critical flows. No Cloud Functions to deploy (Spark plan — all logic is in API routes).

#### Vercel Cron — verify

- [ ] `app/api/cron/sitemap/route.ts` exists and calls `revalidatePath`
- [ ] `vercel.json` has `"crons": [{ "path": "/api/cron/sitemap", "schedule": "0 20 * * *" }]`
- [ ] Confirm cron fires on Vercel preview deployment

#### Unit Tests (Vitest)

- [ ] `lib/formatCurrency.test.ts`
- [ ] `lib/loyalty.test.ts` — `calculateCoinsEarned`, `calculateMaxRedeemable`, `applyCoinsToOrder`
- [ ] `lib/whatsapp.test.ts` — `buildCheckoutMessageURL`, `verifyWebhookSignature`
- [ ] `lib/inventory.test.ts` — all command parsers (RESTOCK, SOLDOUT, PREORDER, STATUS, STOCK)
- [ ] `lib/razorpay.test.ts` — `verifyPaymentSignature` valid + tampered payloads
- [ ] `lib/firebase/discounts.test.ts` — `validateDiscount` edge cases (expired, over maxUses, min order)
- [ ] `components/ui/Button.test.tsx`
- [ ] `components/product/PriceTag.test.tsx`
- [ ] `components/product/StockBadge.test.tsx`

#### Integration Tests (Vitest + Firestore emulator)

- [ ] `app/api/checkout/route.test.ts` — stock reservation transaction, discount validation, coin redemption, COD fee
- [ ] `app/api/webhooks/whatsapp/route.test.ts` — HMAC verification, RESTOCK/STATUS commands update Firestore
- [ ] `app/api/payment/razorpay/verify/route.test.ts` — valid + invalid signatures
- [ ] `app/api/review/route.test.ts` — submit, duplicate guard, verified-purchase flag
- [ ] `app/api/support/tickets/route.test.ts` — create, reply, status change

#### E2E Tests (Playwright)

- [ ] `e2e/browse-to-cart.spec.ts` — browse collection → product detail → add to cart → cart page
- [ ] `e2e/checkout-whatsapp.spec.ts` — checkout form → place order → WA redirect → order tracking
- [ ] `e2e/checkout-razorpay.spec.ts` — Razorpay mock → signature verify → order confirmed
- [ ] `e2e/account-orders.spec.ts` — login → order history → order detail → return request
- [ ] `e2e/admin-order-status.spec.ts` — admin login → update status → customer tracking updates in real time
- [ ] `e2e/reviews.spec.ts` — submit review → admin approves → appears on product page
- [ ] `e2e/support-ticket.spec.ts` — create ticket → admin replies → customer sees reply

**Phase 9 gate**

- [ ] All unit tests pass: `pnpm test`
- [ ] All integration tests pass with Firestore emulator: `pnpm test:integration`
- [ ] All E2E tests pass: `pnpm e2e`
- [ ] Zero TypeScript errors: `pnpm typecheck`
- [ ] Production build succeeds: `pnpm build`
- [ ] Vercel dashboard confirms cron job schedule is registered

---

## 13. Future Upgrades

| Upgrade                           | Effort | Notes                                                                                      |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| **No-cost EMI**                   | 3 days | Razorpay config param; show EMI calculator on product page (builds on Phase 8F)            |
| **Algolia search**                | 1 wk   | Mirror `products` to Algolia via Next.js API route on product save; swap `searchProductsServer()` call |
| **Push notifications**            | 3 days | Firebase Cloud Messaging for order status (augments Phase 8E email notifications)          |
| **Mobile app**                    | —      | React Native + Expo; all `lib/firebase/` functions are directly reusable                   |
| **B2B / bulk orders**             | 1 wk   | Separate `OrderType = "retail" \| "b2b"` field; custom pricing tier on `users` doc         |
| **Multi-currency**                | 1 wk   | `siteConfig.currencies[]` + exchange rate; display-only conversion for now                 |
| **Wishlist share**                | 2 days | Generate shareable `/wishlist/share/[token]` link from wishlist snapshot                   |
| **Product comparison**            | 3 days | Side-by-side specs table for up to 3 products; compare-toggle button on `ProductCard`      |
| **Affiliate / referral codes**    | 1 wk   | `?ref=CODE` URL param → tracked to referrer in `users.referredBy`; bonus coins on delivery |

---

_Document version: 1.5 — March 2026_  
_All dynamic content fields editable by admin without code deployment._  
_Licorice comparison: Phase 8 (analytics, reviews, support, settings) maps to Licorice's admin/analytics, admin/reviews, admin/support, admin/settings. Hobson uses modular `lib/firebase/` over Licorice's monolithic `lib/db.ts`. Both share WhatsApp + Razorpay + COD payment, Resend email, next-intl i18n, Firestore Spark, and Zustand._

