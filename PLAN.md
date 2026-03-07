# FatCat Collectibles â€” Full Platform Plan

> **Stack:** Next.js 15 (App Router) Â· Firebase (Firestore, Auth, Storage, Functions) Â· WhatsApp (checkout + inventory bot) Â· Zustand Â· Tailwind CSS
> **Payment (Phase 1):** WhatsApp-message-based Â· **Payment (Phase 2, future):** Razorpay drop-in

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
   - 5.2 [app/ â€” Next.js App Router](#app--nextjs-app-router)
   - 5.3 [components/ â€” UI Component Library](#components--ui-component-library)
   - 5.4 [constants/ â€” Single Source of Truth](#constants--single-source-of-truth)
   - 5.5 [lib/ â€” Business Logic & Data Layer](#lib--business-logic--data-layer)
   - 5.6 [hooks/ â€” React Hooks](#hooks--react-hooks)
   - 5.7 [store/ â€” Zustand Stores](#store--zustand-stores)
   - 5.8 [types/ â€” TypeScript Type Definitions](#types--typescript-type-definitions)
   - 5.9 [functions/ â€” Firebase Cloud Functions](#functions--firebase-cloud-functions)
   - 5.10 [scripts/ â€” Developer Utilities](#scripts--developer-utilities)
6. [Firestore Schema](#6-firestore-schema)
7. [Constants & DRY Design](#7-constants--dry-design)
8. [Feature Breakdown](#8-feature-breakdown)
   - 8.1 [Product Catalog](#81-product-catalog)
   - 8.2 [Cart & WhatsApp Checkout](#82-cart--whatsapp-checkout)
   - 8.3 [Order Tracking](#83-order-tracking)
   - 8.4 [Inventory Management via WhatsApp](#84-inventory-management-via-whatsapp)
   - 8.5 [Loyalty â€” FCC Coins](#85-loyalty--fcc-coins)
   - 8.6 [Pre-orders](#86-pre-orders)
   - 8.7 [Admin Panel](#87-admin-panel)
   - 8.8 [Blog & Content Pages](#88-blog--content-pages)
9. [API Routes](#9-api-routes)
10. [Cloud Functions](#10-cloud-functions)
11. [Security Design](#11-security-design)
12. [Phased Implementation Plan](#12-phased-implementation-plan)
    - 12.1 [Phase 1 â€” Foundation](#121-phase-1--foundation)
    - 12.2 [Phase 2 â€” Core UX](#122-phase-2--core-ux)
    - 12.3 [Phase 3 â€” Order Tracking](#123-phase-3--order-tracking)
    - 12.4 [Phase 4 â€” Inventory via WhatsApp](#124-phase-4--inventory-via-whatsapp)
    - 12.5 [Phase 5 â€” Content & SEO](#125-phase-5--content--seo)
    - 12.6 [Phase 6 â€” Admin Panel](#126-phase-6--admin-panel)
    - 12.7 [Phase 7 â€” Loyalty & Pre-orders](#127-phase-7--loyalty--pre-orders)
13. [Future Upgrades](#13-future-upgrades)

---

## 0. Development Setup

### 0.1 Prerequisites

| Tool         | Version  | Install                            |
| ------------ | -------- | ---------------------------------- |
| Node.js      | â‰¥ 20 LTS | [nodejs.org](https://nodejs.org)   |
| pnpm         | â‰¥ 9      | `npm i -g pnpm`                    |
| Firebase CLI | â‰¥ 13     | `npm i -g firebase-tools`          |
| Git          | â‰¥ 2.40   | [git-scm.com](https://git-scm.com) |

**Recommended VS Code extensions:** ESLint Â· Prettier Â· Tailwind CSS IntelliSense Â· Firebase Explorer

---

### 0.2 Environment Variables

Create `.env.local` at repo root (never commit â€” `.gitignore`'d). Copy from `.env.example`.

```bash
# â”€â”€â”€ Firebase Client (public â€” safe in browser) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# â”€â”€â”€ Firebase Admin SDK (server-only â€” NEVER expose client-side) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
FIREBASE_SERVICE_ACCOUNT_JSON=          # full JSON string of service account key

# â”€â”€â”€ WhatsApp / Messaging â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
WHATSAPP_WEBHOOK_SECRET=                # HMAC secret for inbound webhook verification
WHATSAPP_API_TOKEN=                     # Twilio/Wati API bearer token (if using send API)

# â”€â”€â”€ App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
main          â† production-ready; protected; CI must pass before merge
  â””â”€ dev      â† integration branch; all phase branches merge here first
       â”œâ”€ phase/1-foundation
       â”œâ”€ phase/2-core-ux
       â”œâ”€ phase/3-order-tracking
       â”œâ”€ phase/4-inventory-bot
       â”œâ”€ phase/5-content-seo
       â”œâ”€ phase/6-admin
       â””â”€ phase/7-loyalty
```

**Commit convention (Conventional Commits):**

```
feat(cart): add qty stepper with min/max guard
fix(checkout): prevent double-submit on slow network
chore(deps): bump firebase to 11.x
refactor(products): extract PriceTag into standalone component
docs(plan): update phase 2 checklist
```

**Per-phase gate:** Before merging a phase branch â†’ `dev`:

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
| State          | Zustand for cart/wishlist. No prop-drilling beyond 2 levels â€” use context or store                                                 |
| Data fetching  | Server Components fetch Firestore directly. Client components use `onSnapshot` only for real-time needs                            |
| Styling        | Tailwind utility classes only. No inline `style={}` except for dynamic values not expressible in Tailwind                          |
| File naming    | `PascalCase.tsx` for components, `camelCase.ts` for non-component modules                                                          |
| Constants      | All magic strings/numbers in `constants/`. Never hardcode Firestore collection names in page files                                 |
| Security       | Sanitise all rich text with DOMPurify server-side. Never trust client-provided userId for writes â€” always read from server session |
| Error handling | Use `try/catch` with typed errors at API route and Cloud Function boundaries only                                                  |

---

### 0.6 Testing Strategy

| Layer       | Tool                           | Scope                                                                                    |
| ----------- | ------------------------------ | ---------------------------------------------------------------------------------------- |
| Unit        | Vitest                         | `lib/` utilities (formatCurrency, loyalty calc, whatsapp builders, discount validation)  |
| Component   | Vitest + React Testing Library | UI primitives (Button, Input, PriceTag, StockBadge)                                      |
| Integration | Vitest + Firestore emulator    | API routes (`/api/checkout`, `/api/webhooks/whatsapp`)                                   |
| E2E         | Playwright                     | Critical flows: browse â†’ add to cart â†’ checkout â†’ WA redirect; admin order status update |

Test files co-located: `lib/formatCurrency.test.ts`, `components/ui/Button.test.tsx`.  
Run all: `pnpm test`. Run watch: `pnpm test --watch`.

---

---

## 1. Site Overview

FatCat Collectibles is a premium collectibles e-commerce store operating in India with two physical outlets (Pune, Bengaluru). The platform sells licensed action figures, statues, and pop-culture collectibles across 20+ franchise categories and 20+ brand collections, ranging from â‚¹1,699 to â‚¹1,78,999+.

### Business Characteristics

| Property           | Value                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Currency           | INR (â‚¹)                                                                                        |
| Primary categories | Franchise (TMNT, Marvel, DC, Star Wars, etc.) + Brand (Hot Toys, Sideshow, Iron Studios, etc.) |
| Order type         | In-stock + Pre-order                                                                           |
| Payment (Phase 1)  | WhatsApp message â†’ owner manual confirmation                                                   |
| Payment (Phase 2)  | Razorpay (no-cost EMI above â‚¹6,000)                                                            |
| Loyalty            | FCC Coins â€” earn on purchase, redeem on next order                                             |
| Shipping           | Free pan-India                                                                                 |
| Support            | WhatsApp + Phone, Monâ€“Fri 11amâ€“8pm IST                                                         |
| Admin contacts     | Customer Care: +91 7620783819 Â· Statues: +91 7887888187                                        |

---

## 2. As-Crawled Site Map

Every page below was directly crawled from `fatcatcollectibles.in`. Our build replicates each one 1:1 using the Next.js route and content elements listed.

---

### 2.1 All Pages & URLs

#### `/` â€” Homepage

**Next.js route:** `app/(storefront)/page.tsx`

| Section                    | Real Content                                                                                                                                                                             | Implementation                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Announcement bar           | Rotating 2 messages: "NO COST EMI ON ORDERS ABOVE â‚¹6000" + "FATCAT Bengaluru Store Now Open!"                                                                                            | `AnnouncementBar` â† Firestore `announcements`                |
| Hero carousel              | 4â€“5 slides (images + CTAs â€” Browse INART Collection, etc.)                                                                                                                               | `HeroBanner` â† Firestore `banners`                           |
| Franchise collection strip | TMNT, DC Comics, Marvel, Transformers, G.I. Joe, Star Wars, MOTU, One Piece, Demon Slayer, Naruto, DBZ, Attack on Titan, JJK, + more                                                     | `CollectionStrip` â† Firestore `collections` (type=franchise) |
| Brand logo strip           | Prime 1 Studios, Sideshow, Iron Studios, McFarlane, First 4 Figures, Super7, Funko, Threezero, NECA, Mezco, Diamond, Storm, Tsume, Infinity Studios, Kotobukiya, Hot Toys, INART, + more | `BrandStrip` â† Firestore `collections` (type=brand)          |
| Featured collection row    | "Featured collection" title + horizontal product carousel with "View all" link                                                                                                           | `HomeSection` â† Firestore `homeSections` (type=featured)     |
| Bestsellers row            | "POPULARS â€” CHECK THE BESTSELLERS" + product carousel                                                                                                                                    | `HomeSection` â† Firestore `homeSections` (type=bestseller)   |
| Mid-page promo banners     | 4 inline banners: Tintin, Harry Potter, Puzzles, Black Panther (each with "Buy Now"/"Explore" CTA)                                                                                       | `PromoGrid` â† Firestore `promobanners`                       |
| Testimonials carousel      | 20+ customer testimonials with name + star rating + text. Scrollable.                                                                                                                    | `TestimonialsCarousel` â† Firestore `testimonials`            |
| FAQ accordion              | 4 questions (shipping time, shipping cost, international shipping, discount code help)                                                                                                   | `FAQAccordion` â† Firestore `faq`                             |
| Trust badge row            | Free Shipping Â· Customer Service Â· Earn FCC Coins Â· Secure Payment (RazorPay badge)                                                                                                      | `TrustBadges` â† Firestore `siteConfig.trustBadges[]`         |
| Newsletter signup          | "Join our VIP list!" email input + Subscribe                                                                                                                                             | `NewsletterSignup`                                           |
| Footer                     | See Â§2.4                                                                                                                                                                                 | `Footer`                                                     |

---

#### `/collections` â€” All Collections Index

**Next.js route:** `app/(storefront)/collections/page.tsx`  
**Render:** ISR, revalidate 300s

Content: Full alphabetical grid of every collection tile (both franchise + brand). Paginated (`?page=2`).  
Each tile is a link card with collection name â†’ `/collections/[slug]`.

All collection slugs discovered:
`1-6-scale`, `action-figures`, `aliens-predators`, `animation-1`, `anime-japanese`, `aquarius-entertainment`, `assassins-creed`, `attack-on-titans`, `bandai-namco`, `bandai-tamashii`, `banpresto`, `batman`, `black-panther`, `dc-comics`, `demon-slayer`, `dragon-ball-z`, `first-4-figures`, `funko`, `g-i-joe`, `harry-potter`, `hot-toys`, `inart`, `infinity-studios`, `iron-studios`, `jujutsu-kaisen`, `kotobukiya`, `marvel`, `masters-of-the-universe`, `mcfarlane-toys`, `mezco-toys`, `naruto`, `neca`, `one-piece`, `prime-1-studios`, `puzzles`, `queen-studios`, `sideshow`, `star-wars`, `storm-collectibles`, `super7`, `the-adventures-of-tintin`, `threezero-1`, `tmnt`, `transformers`, `tsume-art`, `vendors` (brand listing), `warhammer-40000`, `whats-new`, `wwe`, + more via page 2.

---

#### `/collections/[slug]` â€” Collection Listing Page

**Next.js route:** `app/(storefront)/collections/[slug]/page.tsx`  
**Render:** ISR, revalidate 300s

| Element                 | Content                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Collection banner image | Full-width header image (e.g., Marvel banner, DC banner, Hot Toys banner)                                                                               |
| Collection title        | e.g., "MARVEL", "What's New", "HOT TOYS"                                                                                                                |
| Collection description  | e.g., "See what's new latest additions, upcoming releasesâ€¦"                                                                                             |
| Product count           | "484 products", "756 products" etc.                                                                                                                     |
| Filter & Sort button    | Opens filter panel: Availability (In Stock / Sold Out), Price range, Brand, Sort by (Featured / Price asc / Price desc / Aâ€“Z / Zâ€“A / Oldâ€“New / Newâ€“Old) |
| Product grid            | Responsive grid, 4 cols desktop â†’ 2 cols mobile                                                                                                         |
| Product card            | Image (hover shows second image), sold-out overlay, sale badge, name, sale price + regular price strikethrough                                          |
| Pagination              | Previous / Next links (`?page=N`)                                                                                                                       |

---

#### `/products/[slug]` â€” Product Detail Page

**Next.js route:** `app/(storefront)/products/[slug]/page.tsx`  
**Render:** ISR, revalidate 300s

| Element               | Content                                                       | Detail                                                                                    |
| --------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Image gallery         | Up to 20 product images                                       | Thumbnail filmstrip left, main image right, zoom on click/hover, carousel navigation dots |
| Brand breadcrumb link | e.g., "HOT TOYS"                                              | Links to `/collections/hot-toys`                                                          |
| Product title         | Full product name                                             |                                                                                           |
| Price block           | Sale price (bold red) + Regular price (grey strikethrough)    | `PriceTag` component                                                                      |
| Description           | Rich text body                                                | ETA line for pre-orders (e.g., "ETA: Mar/Apr 2026")                                       |
| Quantity selector     | Stepper: `âˆ’` `1` `+`                                          | Min 1, max = available stock                                                              |
| Wishlist button       | "Add to Wishlist" text button                                 | Toggles Zustand wishlist                                                                  |
| Primary CTA           | "Pre-order" or "Add to Cart"                                  | Context-aware based on `isPreorder` + `inStock`                                           |
| Secondary CTA         | "Buy it now"                                                  | Bypasses cart, goes straight to checkout                                                  |
| Trust badges          | Free Shipping Â· Customer Service Â· FCC Coins Â· Secure Payment | Reuses homepage `TrustBadges` component                                                   |
| Sold-out state        | "Sold out" label, disabled Add to Cart                        | Driven by `inStock` / `availableStock`                                                    |

---

#### `/search` â€” Search Page

**Next.js route:** `app/(storefront)/search/page.tsx`  
**Render:** No cache (SSR per request)

| Element          | Content                                                                          |
| ---------------- | -------------------------------------------------------------------------------- |
| Search input     | Centered text input with search icon, `q` query param                            |
| Results grid     | Same `ProductGrid` + `ProductCard` as collection page when query returns results |
| No results state | "No products found for '[query]'" + link to browse all                           |

---

#### `/cart` â€” Cart Page

**Next.js route:** `app/(storefront)/cart/page.tsx`

| Element         | Content                                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| Empty state     | "Your cart is empty" heading + "Continue shopping" link â†’ `/collections/all`       |
| Populated state | Line items (image, name, price, qty stepper, remove), subtotal, "Check Out" button |
| Checkout entry  | Leads to `/checkout`                                                               |

---

#### `/checkout` â€” Checkout Page (Our Addition)

**Next.js route:** `app/(storefront)/checkout/page.tsx`  
_The original Shopify site uses Shopify Checkout. We replace this with our WhatsApp flow._

| Element          | Content                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Address form     | Name, Phone, Address line 1, Line 2, City, State, Pincode                                      |
| Saved addresses  | Picker if user is logged in                                                                    |
| FCC Coins toggle | "Use X coins (save â‚¹Y)"                                                                        |
| Discount code    | Input + Apply                                                                                  |
| Order summary    | Readonly cart items + subtotal, discount, coins, total                                         |
| CTA              | "Place Order via WhatsApp" â†’ writes to Firestore, redirects to `wa.me` with pre-filled message |

---

#### `/orders/[orderId]/track` â€” Order Tracking (Our Addition)

**Next.js route:** `app/(storefront)/orders/[orderId]/track/page.tsx`  
_Not on original Shopify site â€” we add this for our custom order flow._

| Element              | Content                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| Status stepper       | Vertical timeline: each step = status name + timestamp from `statusHistory` |
| Current status badge | Colour-coded per `orderStatusConfig`                                        |
| Tracking info        | Courier name + tracking URL when shipped                                    |
| Real-time            | `onSnapshot` updates status without page refresh                            |

---

#### `/account/login` â€” Login / Register

**Next.js route:** `app/(auth)/login/page.tsx`  
_Original site redirects to Shopify/shop.app auth. We use Firebase Auth._

| Element         | Content                             |
| --------------- | ----------------------------------- |
| Sign in form    | Email + Password                    |
| Google sign-in  | "Continue with Google" OAuth button |
| Register link   | "Don't have an account? Register"   |
| Forgot password | Link to `/forgot-password`          |

---

#### `/account` â€” Account Dashboard

**Next.js route:** `app/(storefront)/account/page.tsx`

| Element           | Content                                |
| ----------------- | -------------------------------------- |
| Profile info      | Name, Email, Phone                     |
| FCC Coins balance | Current balance + "View history" link  |
| Quick links       | My Orders Â· My Wishlist Â· My Addresses |

---

#### `/account/orders` â€” Order History

**Next.js route:** `app/(storefront)/account/orders/page.tsx`

| Element     | Content                                                     |
| ----------- | ----------------------------------------------------------- |
| Order list  | Each row: Order ID, date, total, status badge, "Track" link |
| Empty state | "No orders yet. Start shopping!"                            |

---

#### `/account/orders/[orderId]` â€” Order Detail

**Next.js route:** `app/(storefront)/account/orders/[orderId]/page.tsx`

Line items, totals, delivery address, status history timeline.

---

#### `/account/wishlist` â€” Wishlist

**Next.js route:** `app/(storefront)/account/wishlist/page.tsx`  
_Original site uses `/apps/wishlist` Shopify app. We build natively._

Product grid of saved wishlist items (pulled from `users/{uid}.wishlist`). Each card has "Add to Cart" + "Remove" actions.

---

#### `/account/addresses` â€” Saved Addresses

**Next.js route:** `app/(storefront)/account/addresses/page.tsx`

| Element         | Content                                               |
| --------------- | ----------------------------------------------------- |
| Address cards   | Name, full address text, phone, Edit / Delete buttons |
| Add address     | "Add a new address" form                              |
| Default address | Radio to set default                                  |

---

#### `/blog` â€” Blog Index

**Next.js route:** `app/(storefront)/blog/page.tsx`  
**Render:** ISR, revalidate 3600s  
**Current state on live site:** "This blog is empty" â€” we build it ready to publish. Shows empty state until posts are added via admin.

---

#### `/blog/[slug]` â€” Blog Post

**Next.js route:** `app/(storefront)/blog/[slug]/page.tsx`  
**Render:** ISR, revalidate 3600s

Cover image, title, author, date, rich-text body.

---

#### `/about` â€” About Us

**Next.js route:** `app/(storefront)/[pageSlug]/page.tsx` (slug = `about`)  
**Firestore:** `pages/about`

Rich text body (company history since 2011, authorised distributor list: Sideshow, Iron Studios, Prime 1 Studio, XM Studios, Queen Studios, Hot Toys, Blitzway, Kotobukiya, Chronicle, Funko, DC Collectibles).

---

#### `/contact` â€” Contact Us

**Next.js route:** `app/(storefront)/[pageSlug]/page.tsx` (slug = `contact`)  
**Firestore:** `pages/contact`

| Element         | Content                                                           |
| --------------- | ----------------------------------------------------------------- |
| Page heading    | "Contact Us"                                                      |
| Section heading | "Do you have any question?"                                       |
| Contact form    | Name Â· Email Â· Message Â· "Send message" button (POST to Firebase) |
| Store info      | Pulled from `siteConfig.locations[]` + WA/phone numbers           |

---

#### `/policies/terms-of-service` â€” Terms of Service

**Next.js route:** `app/(storefront)/policies/[policy]/page.tsx`  
**Firestore:** `pages/terms-of-service`

20 sections (online store terms, general conditions, accuracy, modifications, products, billing, optional tools, third-party links, user comments, personal information, errors, prohibited uses, disclaimer, indemnification, severability, termination, entire agreement, governing law, changes, contact info). Rendered as sanitised rich text.

---

#### `/policies/privacy-policy` â€” Privacy Policy

**Next.js route:** `app/(storefront)/policies/[policy]/page.tsx`  
**Firestore:** `pages/privacy-policy`

4 sections: General Information Â· Information We Collect Â· Stock Availability Â· Pre-orders.

---

#### `/policies/shipping-policy` â€” Shipping Policy

**Next.js route:** `app/(storefront)/policies/[policy]/page.tsx`  
**Firestore:** `pages/shipping-policy`

9 numbered sections: Destinations (India) Â· Processing Time (4â€“5 days) Â· Carriers (DTDC, Bluedart, Tirupathi, Mark Express, Delhivery) Â· Costs (free above â‚¹999) Â· Express (2â€“3 days, customer bears cost) Â· Estimated Delivery Â· Order Tracking Â· International Â· Order Status & Support.

---

#### `/policies/refund-policy` â€” Refund Policy

**Next.js route:** `app/(storefront)/policies/[policy]/page.tsx`  
**Firestore:** `pages/refund-policy`

4 sections: Order Changes/Replacements (24hr window) Â· Refund & Cancellation (10% processing fee, NRD forfeited, premium brands 30â€“35% NRD) Â· Exclusive Product Orders Â· Replacement (manufacturing defect, video documentation required, sale items excluded).

---

### 2.2 Navigation Structure

```
[Announcement Bar â€” rotates 2 messages from Firestore `announcements`]

[FATCAT COLLECTIBLES logo]  [Collections â–¾]  [Search ðŸ”]  [Account ðŸ‘¤]  [Wishlist â™¡]  [Cart ðŸ›’ (count)]

Collections mega-menu
â”œâ”€â”€ Browse by Franchise
â”‚   TMNT Â· DC Comics Â· Marvel Â· Transformers Â· G.I. Joe Â· Star Wars Â· MOTU Â· One Piece
â”‚   Demon Slayer Â· Naruto Â· Dragon Ball Z Â· Attack on Titan Â· Jujutsu Kaisen Â· + more
â””â”€â”€ Browse by Brand
    Prime 1 Studio Â· Sideshow Â· Iron Studios Â· McFarlane Toys Â· First 4 Figures Â· Super7
    Funko Â· Threezero Â· NECA Â· Mezco Toys Â· Diamond Â· Storm Collectibles Â· Tsume Art
    Infinity Studios Â· Kotobukiya Â· Hot Toys Â· INART Â· Queen Studios Â· + more
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
  Free Shipping (pan-India)  Â·  Customer Service (Monâ€“Fri)  Â·  Earn FCC Coins  Â·  Secure Payment (RazorPay)

[4-column footer grid]
  Our Info                Shop              Store Policies          Contact
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  Home                    My Account        Terms & Conditions      Email: fatcatcollectibles.in@gmail.com
  Search                  My Wishlist       Privacy Policy          Customer Care WA: +91 7620783819
  Blog                    My Orders         Shipping Policy         Customer Care Phone: +91 7620783819
  About                   My Addresses      Refund Policy           Statues Queries: +91 7887888187
  Contact Us                                                        PUNE: A-1 GF, Ashiana Park, Koregaon Park - 411001
                                                                    BENGALURU: 1134, 100 Feet Rd, Indiranagar - 560008
                                                                    Support: Monâ€“Fri 11amâ€“8pm IST

[Newsletter Signup]  Email input + Subscribe button

[Social Links]  Facebook Â· Instagram Â· WhatsApp

[Copyright]  Â© 2026, FATCAT COLLECTIBLES
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Client (Browser / Mobile)                                   â”‚
â”‚  Next.js App Router â€” SSR + ISR + Client Islands            â”‚
â”‚  Tailwind CSS Â· Zustand (cart, wishlist) Â· Firebase SDK      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚ HTTPS                     â”‚ Real-time onSnapshot
               â–¼                           â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Next.js API Routes       â”‚   â”‚  Firebase Firestore            â”‚
â”‚  /api/webhooks/whatsapp   â”‚   â”‚  (DB + real-time)             â”‚
â”‚  /api/auth/[...nextauth]  â”‚   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  /api/admin/orders        â”‚   â”‚  Firebase Auth                â”‚
â”‚  /api/admin/products      â”‚   â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  /api/sitemap             â”‚   â”‚  Firebase Storage             â”‚
â”‚  /api/revalidate          â”‚   â”‚  (product images, blog media) â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Firebase Cloud Functions â”‚
â”‚  onProductWrite()         â”‚  â†’ low stock / sold-out WA alert
â”‚  onOrderWrite()           â”‚  â†’ status-change WA to customer
â”‚  onUserCoinUpdate()       â”‚  â†’ coin balance guard
â”‚  scheduledSitemapRebuild()â”‚  â†’ daily ISR revalidation
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  WhatsApp Business API   â”‚
â”‚  (Twilio / Wati.io)      â”‚
â”‚  Outbound: order alerts  â”‚
â”‚  Inbound:  bot commands  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 5. Folder Structure

### Root Layout

```
fatcat/                                   # Monorepo root
â”œâ”€â”€ app/                                  # Next.js App Router root
â”œâ”€â”€ components/
â”œâ”€â”€ constants/
â”œâ”€â”€ lib/
â”œâ”€â”€ hooks/
â”œâ”€â”€ types/
â”œâ”€â”€ store/
â”œâ”€â”€ functions/                            # Firebase Cloud Functions (separate package)
â”œâ”€â”€ public/
â”œâ”€â”€ scripts/                              # One-off dev/data scripts
â”œâ”€â”€ .env.local                            # Local secrets (never committed)
â”œâ”€â”€ .env.example                          # Checked-in reference of all required env vars
â”œâ”€â”€ .gitignore
â”œâ”€â”€ .eslintrc.json
â”œâ”€â”€ .prettierrc
â”œâ”€â”€ next.config.ts
â”œâ”€â”€ tailwind.config.ts
â”œâ”€â”€ postcss.config.js
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ tsconfig.paths.json                   # Path aliases (@/lib, @/components, etc.)
â”œâ”€â”€ middleware.ts                         # Auth guard for /admin/** + /account/**
â”œâ”€â”€ firebase.json                         # Firebase project config (hosting, functions)
â”œâ”€â”€ firestore.rules                       # Firestore Security Rules
â”œâ”€â”€ firestore.indexes.json                # Composite index definitions
â”œâ”€â”€ storage.rules                         # Firebase Storage Security Rules
â””â”€â”€ package.json
```

---

### `app/` â€” Next.js App Router

```
app/
â”œâ”€â”€ layout.tsx                            # Root layout â€” <html>, fonts, global providers
â”œâ”€â”€ globals.css                           # Tailwind base + custom CSS variables
â”œâ”€â”€ not-found.tsx                         # Global 404 page
â”œâ”€â”€ error.tsx                             # Global error boundary
â”œâ”€â”€ loading.tsx                           # Global suspense fallback
â”‚
â”œâ”€â”€ (storefront)/                         # Route group: public storefront
â”‚   â”œâ”€â”€ layout.tsx                        # Navbar + Footer + AnnouncementBar + CartProvider
â”‚   â”‚
â”‚   â”œâ”€â”€ page.tsx                          # / â€” Homepage (ISR revalidate: 300)
â”‚   â”‚                                     # Sections (all dynamic from Firestore):
â”‚   â”‚                                     #   AnnouncementBar (announcements)
â”‚   â”‚                                     #   HeroBanner carousel (banners)
â”‚   â”‚                                     #   CollectionStrip â€” franchise (collections type=franchise)
â”‚   â”‚                                     #   BrandStrip â€” brand logos (collections type=brand)
â”‚   â”‚                                     #   HomeSections[] â€” featured + bestsellers (homeSections)
â”‚   â”‚                                     #   PromoGrid â€” 4 inline banners (promobanners)
â”‚   â”‚                                     #   TestimonialsCarousel (testimonials)
â”‚   â”‚                                     #   FAQAccordion (faq)
â”‚   â”‚                                     #   TrustBadges (siteConfig.trustBadges)
â”‚   â”‚                                     #   NewsletterSignup
â”‚   â”‚
â”‚   â”œâ”€â”€ collections/
â”‚   â”‚   â”œâ”€â”€ page.tsx                      # /collections â€” All collections index (ISR 300s)
â”‚   â”‚   â”‚                                 # Alphabetical grid of all collection tiles (paginated)
â”‚   â”‚   â””â”€â”€ [slug]/
â”‚   â”‚       â”œâ”€â”€ page.tsx                  # /collections/[slug] â€” Product grid (ISR 300s)
â”‚   â”‚       â”‚                             # Reads: collection banner, title, description,
â”‚   â”‚       â”‚                             # product count, filter/sort, product grid, pagination
â”‚   â”‚       â””â”€â”€ loading.tsx               # Skeleton: banner shimmer + product grid skeleton
â”‚   â”‚
â”‚   â”œâ”€â”€ products/
â”‚   â”‚   â””â”€â”€ [slug]/
â”‚   â”‚       â”œâ”€â”€ page.tsx                  # /products/[slug] â€” Product detail (ISR 300s)
â”‚   â”‚       â”‚                             # Sections: image gallery (up to 20 imgs + zoom),
â”‚   â”‚       â”‚                             # brand link, title, PriceTag, description, ETA,
â”‚   â”‚       â”‚                             # qty stepper, wishlist btn, add-to-cart/pre-order CTA,
â”‚   â”‚       â”‚                             # buy-it-now CTA, TrustBadges
â”‚   â”‚       â”œâ”€â”€ loading.tsx               # Skeleton: gallery + detail shimmer
â”‚   â”‚       â””â”€â”€ _components/
â”‚   â”‚           â”œâ”€â”€ ImageGallery.tsx      # Client: thumbnail filmstrip + main image + zoom modal
â”‚   â”‚           â”œâ”€â”€ AddToCartSection.tsx  # Client island: qty stepper + add to cart + buy now
â”‚   â”‚           â”œâ”€â”€ WishlistButton.tsx    # Client island: heart toggle â†’ Zustand wishlist
â”‚   â”‚           â””â”€â”€ RelatedProducts.tsx   # Server: products from same franchise/brand
â”‚   â”‚
â”‚   â”œâ”€â”€ search/
â”‚   â”‚   â”œâ”€â”€ page.tsx                      # /search â€” Full-text search results (SSR, no cache)
â”‚   â”‚   â”‚                                 # ?q= query param â†’ Firestore prefix query
â”‚   â”‚   â”‚                                 # Same ProductGrid + filter/sort as collection page
â”‚   â”‚   â””â”€â”€ loading.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ cart/
â”‚   â”‚   â””â”€â”€ page.tsx                      # /cart â€” Cart page
â”‚   â”‚                                     # Empty state: "Your cart is empty" + "Continue shopping"
â”‚   â”‚                                     # Populated: line items, qty stepper, remove, subtotal,
â”‚   â”‚                                     # "Check Out" â†’ /checkout
â”‚   â”‚
â”‚   â”œâ”€â”€ checkout/
â”‚   â”‚   â”œâ”€â”€ page.tsx                      # /checkout â€” Our WhatsApp checkout (replaces Shopify)
â”‚   â”‚   â””â”€â”€ _components/
â”‚   â”‚       â”œâ”€â”€ AddressForm.tsx           # Name, phone, line1, line2, city, state, pincode
â”‚   â”‚       â”œâ”€â”€ SavedAddressPicker.tsx    # Select from account addresses (logged-in users)
â”‚   â”‚       â”œâ”€â”€ CoinRedeemToggle.tsx      # "Use X coins (save â‚¹Y)" toggle
â”‚   â”‚       â”œâ”€â”€ DiscountCodeInput.tsx     # Code input + validate against Firestore discounts
â”‚   â”‚       â””â”€â”€ OrderSummary.tsx          # Readonly: items, subtotal, discount, coins, total
â”‚   â”‚
â”‚   â”œâ”€â”€ orders/
â”‚   â”‚   â””â”€â”€ [orderId]/
â”‚   â”‚       â””â”€â”€ track/
â”‚   â”‚           â”œâ”€â”€ page.tsx              # /orders/[id]/track â€” Order tracking (our addition)
â”‚   â”‚           â”‚                         # Vertical status stepper, real-time via onSnapshot,
â”‚   â”‚           â”‚                         # courier + tracking link when status â‰¥ shipped
â”‚   â”‚           â””â”€â”€ loading.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ account/
â”‚   â”‚   â”œâ”€â”€ layout.tsx                    # Account sidebar: Profile Â· Orders Â· Wishlist Â· Addresses
â”‚   â”‚   â”œâ”€â”€ page.tsx                      # /account â€” Profile info + FCC coin balance + quick links
â”‚   â”‚   â”œâ”€â”€ orders/
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx                  # /account/orders â€” Order list (ID, date, total, status, Track)
â”‚   â”‚   â”‚   â””â”€â”€ [orderId]/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx              # /account/orders/[id] â€” Line items, totals, address, timeline
â”‚   â”‚   â”œâ”€â”€ wishlist/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                  # /account/wishlist â€” Product grid from users.wishlist[]
â”‚   â”‚   â””â”€â”€ addresses/
â”‚   â”‚       â””â”€â”€ page.tsx                  # /account/addresses â€” Cards: Add/Edit/Delete/Set default
â”‚   â”‚
â”‚   â”œâ”€â”€ blog/
â”‚   â”‚   â”œâ”€â”€ page.tsx                      # /blog â€” Post index grid (ISR 3600s)
â”‚   â”‚   â”‚                                 # Empty state: "No posts yet" until admin publishes
â”‚   â”‚   â””â”€â”€ [slug]/
â”‚   â”‚       â”œâ”€â”€ page.tsx                  # /blog/[slug] â€” Post: cover, title, author, date, body
â”‚   â”‚       â””â”€â”€ loading.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ policies/
â”‚   â”‚   â””â”€â”€ [policy]/
â”‚   â”‚       â””â”€â”€ page.tsx                  # /policies/[policy] â€” Policy pages (ISR 3600s)
â”‚   â”‚                                     # Slugs: terms-of-service Â· privacy-policy Â·
â”‚   â”‚                                     #        shipping-policy Â· refund-policy
â”‚   â”‚                                     # Content from Firestore `pages/{policy}`
â”‚   â”‚
â”‚   â””â”€â”€ [pageSlug]/
â”‚       â””â”€â”€ page.tsx                      # /about, /contact â€” Info pages (ISR 3600s)
â”‚                                         # about: company history, authorised distributors list
â”‚                                         # contact: contact form (Name/Email/Message) + store info
â”‚
â”œâ”€â”€ (auth)/                               # Route group: auth screens (no Navbar/Footer)
â”‚   â”œâ”€â”€ layout.tsx                        # Centered card layout
â”‚   â”œâ”€â”€ login/
â”‚   â”‚   â””â”€â”€ page.tsx                      # /login â€” Email + Password + Google OAuth
â”‚   â”œâ”€â”€ register/
â”‚   â”‚   â””â”€â”€ page.tsx                      # /register â€” Name + Email + Password + Google
â”‚   â””â”€â”€ forgot-password/
â”‚       â””â”€â”€ page.tsx                      # /forgot-password â€” Email input â†’ Firebase reset email
â”‚
â”œâ”€â”€ (admin)/                              # Route group: admin panel (auth-gated in layout)
â”‚   â”œâ”€â”€ layout.tsx                        # Admin shell: sidebar nav + session check
â”‚   â”‚
â”‚   â”œâ”€â”€ admin/
â”‚   â”‚   â”œâ”€â”€ page.tsx                      # /admin â€” Dashboard: stats, recent orders, low-stock
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ products/
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx                  # /admin/products â€” List, search, quick-stock edit
â”‚   â”‚   â”‚   â”œâ”€â”€ new/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx              # /admin/products/new â€” Create product form
â”‚   â”‚   â”‚   â”œâ”€â”€ [id]/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx              # /admin/products/[id] â€” Edit product
â”‚   â”‚   â”‚   â””â”€â”€ bulk-upload/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx              # /admin/products/bulk-upload â€” CSV upload UI
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ orders/
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx                  # /admin/orders â€” List, filter by status/date
â”‚   â”‚   â”‚   â””â”€â”€ [id]/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx              # /admin/orders/[id] â€” Detail + status change + WA notify
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ collections/
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx                  # /admin/collections â€” List, reorder drag-and-drop
â”‚   â”‚   â”‚   â”œâ”€â”€ new/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ [slug]/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ content/
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx                  # /admin/content â€” Tabs: Banners, Sections, FAQs, Testimonials
â”‚   â”‚   â”‚   â”œâ”€â”€ banners/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ home-sections/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ testimonials/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ faq/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ announcements/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ blog/
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx                  # /admin/blog â€” Post list
â”‚   â”‚   â”‚   â”œâ”€â”€ new/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ [id]/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx              # Rich-text editor
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”‚   â””â”€â”€ [slug]/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx              # /admin/pages/[slug] â€” Edit policy/info page body
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ loyalty/
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx                  # /admin/loyalty â€” Config editor + top holders + manual grant
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ discounts/
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx                  # /admin/discounts â€” Code list
â”‚   â”‚   â”‚   â””â”€â”€ new/
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ config/
â”‚   â”‚       â””â”€â”€ page.tsx                  # /admin/config â€” siteConfig editor (WA numbers, SEO, support hours)
â”‚   â”‚
â””â”€â”€ api/
    â”œâ”€â”€ auth/
    â”‚   â””â”€â”€ [...nextauth]/
    â”‚       â””â”€â”€ route.ts                  # NextAuth.js handler (Firebase adapter)
    â”œâ”€â”€ checkout/
    â”‚   â””â”€â”€ route.ts                      # POST: validate â†’ write order â†’ reserve stock â†’ return WA URL
    â”œâ”€â”€ webhooks/
    â”‚   â””â”€â”€ whatsapp/
    â”‚       â””â”€â”€ route.ts                  # POST: inbound WA bot (HMAC verified)
    â”œâ”€â”€ admin/
    â”‚   â”œâ”€â”€ orders/
    â”‚   â”‚   â””â”€â”€ [id]/
    â”‚   â”‚       â””â”€â”€ status/
    â”‚   â”‚           â””â”€â”€ route.ts          # PATCH: update order status (admin only)
    â”‚   â””â”€â”€ products/
    â”‚       â””â”€â”€ bulk-upload/
    â”‚           â””â”€â”€ route.ts              # POST: CSV â†’ Firestore batch write
    â”œâ”€â”€ revalidate/
    â”‚   â””â”€â”€ route.ts                      # POST: on-demand ISR revalidation (secret-token auth)
    â””â”€â”€ sitemap/
        â””â”€â”€ route.ts                      # GET: dynamic XML sitemap
```

---

### `components/` â€” UI Component Library

```
components/
â”‚
â”œâ”€â”€ ui/                                   # Primitive, reusable UI atoms
â”‚   â”œâ”€â”€ Button.tsx                        # variant: primary | secondary | ghost | danger
â”‚   â”œâ”€â”€ Badge.tsx                         # variant: sale | preorder | soldout | new | coin
â”‚   â”œâ”€â”€ Input.tsx                         # Controlled text input with label + error
â”‚   â”œâ”€â”€ Textarea.tsx
â”‚   â”œâ”€â”€ Select.tsx
â”‚   â”œâ”€â”€ Checkbox.tsx
â”‚   â”œâ”€â”€ Modal.tsx                         # Portal-based modal with backdrop
â”‚   â”œâ”€â”€ Drawer.tsx                        # Slide-in panel (cart, mobile menu)
â”‚   â”œâ”€â”€ Toast.tsx                         # Notification toasts via context
â”‚   â”œâ”€â”€ ToastProvider.tsx
â”‚   â”œâ”€â”€ Skeleton.tsx                      # Base skeleton shimmer
â”‚   â”œâ”€â”€ Spinner.tsx
â”‚   â”œâ”€â”€ Tabs.tsx
â”‚   â”œâ”€â”€ Accordion.tsx                     # Used for FAQ
â”‚   â”œâ”€â”€ RichTextRenderer.tsx              # Renders DOMPurify-sanitised HTML
â”‚   â””â”€â”€ StarRating.tsx                    # 1â€“5 star display (testimonials)
â”‚
â”œâ”€â”€ product/
â”‚   â”œâ”€â”€ ProductCard.tsx                   # Used in: homepage, collections, search, wishlist, admin picker
â”‚   â”œâ”€â”€ ProductCard.skeleton.tsx          # Matching skeleton for ProductCard
â”‚   â”œâ”€â”€ ProductGrid.tsx                   # Responsive grid wrapper
â”‚   â”œâ”€â”€ PriceTag.tsx                      # Handles sale / regular / sold-out / pre-order display
â”‚   â”œâ”€â”€ StockBadge.tsx                    # "In Stock" | "Low Stock" | "Sold Out" | "Pre-order"
â”‚   â”œâ”€â”€ ProductImageGallery.tsx           # Thumbnail strip + zoom lightbox
â”‚   â”œâ”€â”€ ProductSpecsTable.tsx             # Renders specs Record<string, string>
â”‚   â””â”€â”€ ProductFilterSidebar.tsx          # Price, brand, franchise, in-stock filters
â”‚
â”œâ”€â”€ layout/
â”‚   â”œâ”€â”€ Navbar.tsx                        # Logo, nav links (from Firestore collections), cart icon, account
â”‚   â”œâ”€â”€ NavCollectionsMenu.tsx            # Mega-menu dropdown populated from Firestore
â”‚   â”œâ”€â”€ MobileMenu.tsx                    # Full-screen mobile nav drawer
â”‚   â”œâ”€â”€ Footer.tsx                        # Links, social icons, newsletter â€” all from siteConfig
â”‚   â”œâ”€â”€ AnnouncementBar.tsx               # Top bar â€” reads active `announcements` from Firestore
â”‚   â””â”€â”€ Providers.tsx                     # Wraps: AuthProvider, CartProvider, ToastProvider, QueryClientProvider
â”‚
â”œâ”€â”€ home/
â”‚   â”œâ”€â”€ HeroBanner.tsx                    # Auto-advancing carousel â€” reads from Firestore `banners`
â”‚   â”œâ”€â”€ CollectionStrip.tsx               # Scrollable franchise tile row â€” reads `collections` (type=franchise)
â”‚   â”œâ”€â”€ BrandStrip.tsx                    # Horizontal logo scroll â€” reads `collections` (type=brand)
â”‚   â”œâ”€â”€ HomeSection.tsx                   # Generic titled product row (featured / bestseller / new-arrivals)
â”‚   â”œâ”€â”€ HomeSectionList.tsx               # Renders all active `homeSections` in sortOrder
â”‚   â”œâ”€â”€ PromoGrid.tsx                     # 4-tile inline promo banners â€” reads Firestore `promobanners`
â”‚   â”œâ”€â”€ TestimonialsCarousel.tsx          # Reads featured `testimonials` from Firestore
â”‚   â””â”€â”€ FAQAccordion.tsx                  # Reads `faq` from Firestore
â”‚
â”œâ”€â”€ cart/
â”‚   â”œâ”€â”€ CartDrawer.tsx                    # Slide-in cart panel
â”‚   â”œâ”€â”€ CartItem.tsx                      # Single line item: image, name, qty stepper, remove
â”‚   â”œâ”€â”€ CartSummary.tsx                   # Subtotal, coins, discount, total
â”‚   â””â”€â”€ EmptyCart.tsx
â”‚
â”œâ”€â”€ checkout/
â”‚   â”œâ”€â”€ AddressForm.tsx                   # Controlled form: name, phone, address fields
â”‚   â”œâ”€â”€ SavedAddressPicker.tsx            # Select from account addresses
â”‚   â”œâ”€â”€ CoinRedeemToggle.tsx              # Toggle + shows amount saved
â”‚   â”œâ”€â”€ DiscountCodeInput.tsx             # Input + validate + display saving
â”‚   â””â”€â”€ OrderSummary.tsx                  # Read-only cart + totals at checkout
â”‚
â”œâ”€â”€ order/
â”‚   â”œâ”€â”€ OrderStatusStepper.tsx            # Vertical timeline â€” steps from Firestore `orderStatusConfig`
â”‚   â”œâ”€â”€ OrderStatusBadge.tsx              # Colour-coded badge using `orderStatusConfig`
â”‚   â”œâ”€â”€ OrderCard.tsx                     # Compact order row for account/orders list
â”‚   â”œâ”€â”€ OrderItemList.tsx                 # Line items in order detail
â”‚   â””â”€â”€ TrackingBanner.tsx                # Shows courier + tracking link when shipped
â”‚
â”œâ”€â”€ account/
â”‚   â”œâ”€â”€ AccountSidebar.tsx                # Nav: Profile, Orders, Wishlist, Addresses
â”‚   â”œâ”€â”€ CoinBalanceCard.tsx               # Displays balance + history link
â”‚   â””â”€â”€ AddressCard.tsx                   # Address display + edit/delete actions
â”‚
â”œâ”€â”€ blog/
â”‚   â”œâ”€â”€ PostCard.tsx                      # Blog index card: cover, title, excerpt, date
â”‚   â””â”€â”€ PostBody.tsx                      # Renders sanitised rich-text post body
â”‚
â””â”€â”€ admin/
    â”œâ”€â”€ AdminSidebar.tsx                  # Nav links for all admin sections
    â”œâ”€â”€ AdminStatCard.tsx                 # Metric card used on dashboard
    â”œâ”€â”€ ProductForm.tsx                   # Shared new/edit product form
    â”œâ”€â”€ ProductTableRow.tsx               # Row in admin product list with inline stock edit
    â”œâ”€â”€ BulkUploadForm.tsx                # CSV file upload + preview + confirm submit
    â”œâ”€â”€ OrderTable.tsx                    # Filterable order list
    â”œâ”€â”€ StatusChangeForm.tsx              # Dropdown (valid transitions only) + note + AWB + WA toggle
    â”œâ”€â”€ InventoryEditForm.tsx             # Stock, threshold, restock note fields
    â”œâ”€â”€ CameraCapture.tsx                 # Device camera UI: image snapshot + video recording â†’ upload to Firebase Storage
    â”œâ”€â”€ CollectionForm.tsx                # Franchise/brand collection create/edit
    â”œâ”€â”€ BannerForm.tsx
    â”œâ”€â”€ HomeSectionForm.tsx
    â”œâ”€â”€ TestimonialForm.tsx
    â”œâ”€â”€ FAQForm.tsx
    â”œâ”€â”€ AnnouncementForm.tsx
    â”œâ”€â”€ ContentEditor.tsx                 # Rich-text editor (Tiptap) for blog + pages
    â”œâ”€â”€ LoyaltyConfigForm.tsx
    â”œâ”€â”€ DiscountForm.tsx
    â”œâ”€â”€ SiteConfigForm.tsx                # All siteConfig fields in one tabbed form
    â””â”€â”€ DraggableList.tsx                 # Generic drag-to-reorder list (collections, sections)
```

---

### `constants/` â€” Single Source of Truth

```
constants/
â”œâ”€â”€ firebase.ts                           # COLLECTIONS map â€” all Firestore collection names
â”œâ”€â”€ routes.ts                             # ROUTES map â€” all internal URL builders
â”œâ”€â”€ whatsapp.ts                           # INVENTORY_COMMANDS, message template keys
â”œâ”€â”€ orderStatus.ts                        # ORDER_STATUS_TRANSITIONS fallback map
â”œâ”€â”€ inventory.ts                          # DEFAULT_LOW_STOCK_THRESHOLD, RESTOCK_NOTE_MAX_LEN
â””â”€â”€ ui.ts                                 # BREAKPOINTS, Z_INDEX, ANIMATION_MS, TOAST_DURATION_MS
```

---

### `lib/` â€” Business Logic & Data Layer

```
lib/
â”‚
â”œâ”€â”€ firebase/
â”‚   â”œâ”€â”€ client.ts                         # getFirebaseApp() singleton â€” client SDK init
â”‚   â”œâ”€â”€ admin.ts                          # getAdminApp() singleton â€” Admin SDK (server-only)
â”‚   â”œâ”€â”€ products.ts                       # getProduct(), getProducts(), createProduct(),
â”‚   â”‚                                     # updateProduct(), searchProducts(), getRelated()
â”‚   â”œâ”€â”€ orders.ts                         # createOrder(), getOrder(), getUserOrders(),
â”‚   â”‚                                     # updateOrderStatus(), releaseReservedStock()
â”‚   â”œâ”€â”€ users.ts                          # getUser(), updateUser(), awardCoins(),
â”‚   â”‚                                     # redeemCoins(), addAddress(), removeAddress()
â”‚   â”œâ”€â”€ collections.ts                    # getCollection(), getAllCollections(),
â”‚   â”‚                                     # getActiveCollectionsByType()
â”‚   â”œâ”€â”€ content.ts                        # getBanners(), getHomeSections(), getTestimonials(),
â”‚   â”‚                                     # getFAQ(), getAnnouncements(), getPage(), getBlogPost()
â”‚   â”œâ”€â”€ discounts.ts                      # validateDiscount(), incrementDiscountUsage()
â”‚   â””â”€â”€ config.ts                         # getSiteConfig(), getOrderStatusConfig(), getLoyaltyConfig()
â”‚
â”œâ”€â”€ whatsapp.ts                           # buildCheckoutMessageURL(), buildStatusNotificationURL(),
â”‚                                         # parseIncomingWebhook(), verifyWebhookSignature(),
â”‚                                         # isAdminNumber(), buildHelpMessage()
â”‚
â”œâ”€â”€ inventory.ts                          # buildLowStockAlertMessage(), buildSoldOutAlertMessage(),
â”‚                                         # parseRestockCommand(), parseStatusCommand()
â”‚
â”œâ”€â”€ loyalty.ts                            # calculateCoinsEarned(), calculateMaxRedeemable(),
â”‚                                         # applyCoinsToOrder()
â”‚
â”œâ”€â”€ formatCurrency.ts                     # formatINR(amount: number): string
â”‚                                         # formatINRCompact(amount: number): string  (â‚¹1.2L)
â”‚
â””â”€â”€ seo.ts                                # generateProductMetadata(), generateCollectionMetadata(),
                                          # generateBlogMetadata(), generateDefaultMetadata()
```

---

### `hooks/` â€” React Hooks

```
hooks/
â”œâ”€â”€ useCart.ts                            # Zustand cart store + localStorage persist
â”œâ”€â”€ useWishlist.ts                        # Zustand wishlist store + localStorage persist
â”œâ”€â”€ useAuth.ts                            # Firebase onAuthStateChanged wrapper
â”œâ”€â”€ useSiteConfig.ts                      # Firestore onSnapshot for siteConfig/main
â”œâ”€â”€ useOrderStatusConfig.ts               # Firestore onSnapshot for all orderStatusConfig docs
â”œâ”€â”€ useMediaQuery.ts                      # Responsive hook using BREAKPOINTS constant
â””â”€â”€ useDebounce.ts                        # Generic debounce for search input
```

---

### `store/` â€” Zustand Stores

```
store/
â”œâ”€â”€ cartStore.ts                          # items[], add(), remove(), updateQty(), clear(), total
â””â”€â”€ wishlistStore.ts                      # productIds[], toggle(), has()
```

---

### `types/` â€” TypeScript Type Definitions

```
types/
â”œâ”€â”€ product.ts                            # Product, RestockEvent, ProductFilters, ProductSortOption
â”œâ”€â”€ order.ts                              # Order, OrderItem, OrderStatus, OrderStatusEvent, Address
â”œâ”€â”€ user.ts                               # User, CoinHistoryEntry, UserRole
â”œâ”€â”€ cart.ts                               # CartItem
â”œâ”€â”€ content.ts                            # Banner, HomeSection, Testimonial, FAQItem,
â”‚                                         # Announcement, BlogPost, ContentPage
â””â”€â”€ config.ts                             # SiteConfig, SiteLocation, LoyaltyConfig,
                                          # OrderStatusConfig, Discount
```

---

### `functions/` â€” Firebase Cloud Functions

```
functions/
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â””â”€â”€ src/
    â”œâ”€â”€ index.ts                          # Exports all functions
    â”‚
    â”œâ”€â”€ onProductWrite.ts                 # Trigger: products/{id} write
    â”‚                                     # â†’ Recalculate availableStock = stock - reservedStock
    â”‚                                     # â†’ Set inStock flag
    â”‚                                     # â†’ Send low-stock / sold-out WA alert to admin
    â”‚
    â”œâ”€â”€ onOrderWrite.ts                   # Trigger: orders/{id} write
    â”‚                                     # â†’ On status â†’ "delivered": award FCC coins to user
    â”‚                                     # â†’ On status â†’ "delivered": release reservedStock
    â”‚                                     # â†’ On status â†’ "cancelled": release reservedStock
    â”‚
    â”œâ”€â”€ onOrderStatusChange.ts            # Trigger: orders/{id} update (currentStatus field)
    â”‚                                     # â†’ Read orderStatusConfig for new status
    â”‚                                     # â†’ If notifyCustomer=true: send WA via WhatsApp API
    â”‚
    â”œâ”€â”€ onUserCoinUpdate.ts               # Trigger: users/{id} update (fccCoins field)
    â”‚                                     # â†’ Guard: if fccCoins < 0, reset to 0 + log warning
    â”‚
    â””â”€â”€ scheduledSitemapRebuild.ts        # Cloud Scheduler: daily 2am IST
                                          # â†’ POST /api/revalidate for homepage + sitemap
```

---

### `scripts/` â€” Developer Utilities

```
scripts/
â”œâ”€â”€ seed-firestore.ts                     # Populate Firestore with sample products/collections
â”œâ”€â”€ import-products-csv.ts                # One-off CSV import to Firestore
â””â”€â”€ export-orders-csv.ts                  # Dump orders collection to CSV for accounting
```

---

### `public/` â€” Static Assets

```
public/
â”œâ”€â”€ favicon.ico
â”œâ”€â”€ og-default.png                        # Default Open Graph image (1200Ã—630)
â”œâ”€â”€ logo.svg
â”œâ”€â”€ icons/
â”‚   â”œâ”€â”€ whatsapp.svg
â”‚   â”œâ”€â”€ cart.svg
â”‚   â”œâ”€â”€ heart.svg
â”‚   â”œâ”€â”€ search.svg
â”‚   â””â”€â”€ user.svg
â””â”€â”€ fonts/                                # Self-hosted fonts (if not using next/font)
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
  sortOrder: number; // 1â€“4 (4 tiles shown on homepage)
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
  supportHours: string; // "Monday to Friday, 11am â€“ 8pm IST"
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
  coinsPerRupee: number; // e.g. 1 coin per â‚¹100
  rupeePerCoin: number; // e.g. 1 coin = â‚¹1
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
// Static fallback â€” overridden at runtime by Firestore `orderStatusConfig`
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
  STOCK: "STOCK", // STOCK {sku}  â†’ reply with count
  HELP: "HELP",
} as const;
```

### `lib/whatsapp.ts` â€” Builders (dynamic, read WA number from siteConfig)

```ts
export function buildCheckoutMessageURL(
  waNumber: string,
  cart: CartItem[],
  total: number,
  address: Address,
): string {
  const lines = cart.map(
    (i) => `â€¢ ${i.name} Ã—${i.qty} â€” ${formatINR(i.salePrice * i.qty)}`,
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
User adds to cart â†’ CartDrawer (Zustand, persisted localStorage)
  â†’ Checkout page (address form + FCC coins toggle + discount code)
  â†’ POST /api/checkout:
      1. Validate discount code against Firestore
      2. Check availableStock for each item
      3. Write order with status: "pending_payment"
      4. Increment reservedStock on each product
      5. Return orderId + WhatsApp URL
  â†’ Redirect to WhatsApp with pre-filled message
  â†’ Show /orders/{id}/track with "Awaiting Payment" status
```

### 8.3 Order Tracking

**Customer-facing stepper** (`/orders/[id]/track`):

- Auth-gated: order userId must match session user
- Reads `statusHistory` array for timeline
- `onSnapshot` listener for real-time status push
- Status labels, colors, and icons driven by Firestore `orderStatusConfig` (fully dynamic â€” admin changes label without deploy)
- Shows courier name + tracking link when status â‰¥ `shipped`

**Admin order management** (`/admin/orders/[id]`):

- Dropdown populated only with `ORDER_STATUS_TRANSITIONS[currentStatus]` â€” prevents illegal jumps
- Optional note + AWB number fields
- "Notify Customer via WhatsApp" toggle â†’ opens `wa.me` link pre-filled with `orderStatusConfig.waTemplate` with `{orderId}`, `{trackingNumber}`, `{customerName}` replaced

**Status flow:**

```
pending_payment â†’ payment_confirmed â†’ processing â†’ shipped â†’ out_for_delivery â†’ delivered
                                   â†˜ cancelled â†’ refund_initiated
```

### 8.4 Inventory Management via WhatsApp

#### Passive Alerts (Cloud Function â†’ Admin WA)

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
- All command verbs read from `INVENTORY_COMMANDS` constant â€” adding a new command = one constant key + one handler function.

### 8.5 Loyalty â€” FCC Coins

- Earn rate and redemption rate stored in Firestore `loyaltyConfig/main` â€” admin changes without deploy.
- Coins earned on `delivered` status (Cloud Function `onOrderWrite`).
- Coins redeemable at checkout up to `maxRedeemPercent` of order total.
- Cloud Function `onUserCoinUpdate` guards against negative balances.
- Full coin history logged on `users/{uid}.coinHistory`.
- Admin can grant coins manually from `/admin/orders/[id]` page.

### 8.6 Pre-orders

- Products with `isPreorder: true` show "Pre-order" badge, `preorderShipDate`, and different CTA ("Pre-order Now").
- Checkout flow identical to in-stock â€” WhatsApp message prefixed with "PRE-ORDER:".
- Order tagged `isPreorder: true` in Firestore.
- Admin can bulk-convert products to in-stock when shipment arrives (bulk upload or `RESTOCK` bot command).

### 8.7 Admin Panel

**Protected by:** Firebase Auth + Firestore `users/{uid}.role === "admin"` check in middleware.

| Page        | Features                                                                          |
| ----------- | --------------------------------------------------------------------------------- |
| Dashboard   | Order counts by status, revenue (last 7/30 days), low-stock alerts, recent orders |
| Products    | Search/filter list, quick stock edit inline, bulk CSV upload, individual edit; product form supports capturing images and videos directly from device camera via `CameraCapture` component (MediaDevices API / `<input capture>` fallback) â€” captured media uploaded to Firebase Storage and appended to `images[]` / `videos[]`     |
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
| `/api/admin/products/bulk-upload` | POST   | Admin        | CSV â†’ Firestore batch write                |
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
**Phase gate:** typecheck âœ“ Â· lint âœ“ Â· build âœ“ Â· manual smoke-test âœ“

---

### 12.1 Phase 1 â€” Foundation

> **Branch:** `phase/1-foundation`  
> **Commit message:** `feat: Phase 1 â€” Foundation complete`

**Goal:** Runnable Next.js app with Firebase wired up, typed data layer, product browsing, cart, and WhatsApp checkout.

#### Checklist

**Project scaffold**

- [x] `npx create-next-app@latest fatcat --typescript --tailwind --eslint --app`
- [x] Add path aliases (`@/`) in `tsconfig.json` + `tsconfig.paths.json`
- [x] `.env.example` with all required vars documented
- [x] `.gitignore` including `.env.local`, `emulator-data/`, `.firebase/`
- [x] `.eslintrc.json` â€” enable `@typescript-eslint/no-explicit-any`
- [x] `.prettierrc` â€” semi: true, singleQuote: true, tabWidth: 2
- [x] `next.config.ts` â€” images: Firebase Storage domain whitelisted
- [x] `tailwind.config.ts` â€” custom colors (brand red, ink dark), font families
- [x] `package.json` scripts: dev, build, typecheck, lint, format, emulators, seed, deploy

**Firebase & config**

- [x] `firebase.json` â€” hosting + functions config
- [x] `firestore.rules` â€” Phase 1 baseline rules (public read products/collections, auth write orders/users)
- [x] `firestore.indexes.json` â€” indexes for: products by franchise+inStock, products by brand+inStock, orders by userId+createdAt
- [x] `storage.rules` â€” public read images, admin-only write
- [x] `lib/firebase/client.ts` â€” `getFirebaseApp()` singleton (client SDK)
- [x] `lib/firebase/admin.ts` â€” `getAdminApp()` singleton (Admin SDK, server-only)

**Constants (all collection names / routes / config as typed objects)**

- [x] `constants/firebase.ts` â€” `COLLECTIONS` map
- [x] `constants/routes.ts` â€” `ROUTES` map with builder functions
- [x] `constants/orderStatus.ts` â€” `ORDER_STATUS_TRANSITIONS` static fallback
- [x] `constants/whatsapp.ts` â€” `INVENTORY_COMMANDS`
- [x] `constants/inventory.ts` â€” `DEFAULT_LOW_STOCK_THRESHOLD`, `RESTOCK_NOTE_MAX_LEN`
- [x] `constants/ui.ts` â€” `BREAKPOINTS`, `Z_INDEX`, `ANIMATION_MS`, `TOAST_DURATION_MS`

**TypeScript types**

- [x] `types/product.ts` â€” `Product`, `RestockEvent`, `ProductFilters`, `ProductSortOption`
- [x] `types/order.ts` â€” `Order`, `OrderItem`, `OrderStatus`, `OrderStatusEvent`, `Address`
- [x] `types/user.ts` â€” `User`, `CoinHistoryEntry`, `UserRole`
- [x] `types/cart.ts` â€” `CartItem`
- [x] `types/content.ts` â€” `Banner`, `HomeSection`, `Testimonial`, `FAQItem`, `Announcement`, `BlogPost`, `ContentPage`
- [x] `types/config.ts` â€” `SiteConfig`, `SiteLocation`, `LoyaltyConfig`, `OrderStatusConfig`, `Discount`

**Data layer (lib)**

- [x] `lib/firebase/products.ts` â€” `getProduct()`, `getProducts()`, `searchProducts()`, `getRelated()`
- [x] `lib/firebase/collections.ts` â€” `getCollection()`, `getAllCollections()`, `getActiveCollectionsByType()`
- [x] `lib/firebase/config.ts` â€” `getSiteConfig()`, `getLoyaltyConfig()`
- [x] `lib/formatCurrency.ts` â€” `formatINR()`, `formatINRCompact()`
- [x] `lib/whatsapp.ts` â€” `buildCheckoutMessageURL()`, `buildStatusNotificationURL()`

**Zustand stores**

- [x] `store/cartStore.ts` â€” `items[]`, `add()`, `remove()`, `updateQty()`, `clear()`, `total` (localStorage persist)
- [x] `store/wishlistStore.ts` â€” `productIds[]`, `toggle()`, `has()` (localStorage persist)

**Hooks**

- [x] `hooks/useCart.ts`
- [x] `hooks/useWishlist.ts`
- [x] `hooks/useAuth.ts` â€” Firebase `onAuthStateChanged` wrapper
- [x] `hooks/useMediaQuery.ts`
- [x] `hooks/useDebounce.ts`

**UI primitives (`components/ui/`)**

- [x] `Button.tsx` â€” variant: primary | secondary | ghost | danger; loading state
- [x] `Badge.tsx` â€” variant: sale | preorder | soldout | new | coin
- [x] `Input.tsx` â€” controlled, label, error message
- [x] `Textarea.tsx`
- [x] `Select.tsx`
- [x] `Checkbox.tsx`
- [x] `Modal.tsx` â€” portal, backdrop, close on Escape/click-outside
- [x] `Drawer.tsx` â€” slide-in panel (used for cart + mobile menu)
- [x] `Toast.tsx` + `ToastProvider.tsx`
- [x] `Skeleton.tsx` â€” base shimmer
- [x] `Spinner.tsx`
- [x] `Tabs.tsx`
- [x] `Accordion.tsx`
- [x] `RichTextRenderer.tsx` â€” DOMPurify-sanitised HTML render
- [x] `StarRating.tsx`

**Layout components**

- [x] `components/layout/Providers.tsx` â€” wraps AuthProvider, ToastProvider, QueryClientProvider
- [x] `components/layout/Navbar.tsx` â€” logo, collections mega-menu, search, account, wishlist, cart badge
- [x] `components/layout/NavCollectionsMenu.tsx` â€” mega-menu from Firestore
- [x] `components/layout/MobileMenu.tsx` â€” full-screen drawer
- [x] `components/layout/Footer.tsx` â€” links, social, newsletter from `siteConfig`
- [x] `components/layout/AnnouncementBar.tsx`

**Product components**

- [x] `components/product/ProductCard.tsx` â€” image hover, sale badge, price, sold-out overlay
- [x] `components/product/ProductCard.skeleton.tsx`
- [x] `components/product/ProductGrid.tsx` â€” responsive 4â†’2 col grid
- [x] `components/product/PriceTag.tsx` â€” sale/regular/sold-out/pre-order states
- [x] `components/product/StockBadge.tsx`
- [x] `components/product/ProductFilterSidebar.tsx` â€” price, brand, franchise, in-stock
- [x] `components/product/ProductImageGallery.tsx` â€” thumbnail strip + zoom lightbox
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

- [x] `app/layout.tsx` â€” root layout, fonts, global providers
- [x] `app/globals.css` â€” Tailwind base + CSS variables
- [x] `app/not-found.tsx`
- [x] `app/(storefront)/layout.tsx` â€” Navbar + Footer + AnnouncementBar
- [x] `app/(storefront)/collections/page.tsx` â€” all collections grid (ISR 300s)
- [x] `app/(storefront)/collections/[slug]/page.tsx` â€” product listing with filters (ISR 300s)
- [x] `app/(storefront)/collections/[slug]/loading.tsx`
- [x] `app/(storefront)/products/[slug]/page.tsx` â€” product detail (ISR 300s)
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
- [x] `app/api/checkout/route.ts` â€” POST: validate â†’ write order â†’ reserve stock â†’ return WA URL

**Auth & Middleware**

- [x] `middleware.ts` â€” protect `/admin/**` and `/account/**` routes

**Phase 1 gate**

- [x] `pnpm typecheck` â€” 0 errors
- [x] `pnpm lint` â€” 0 errors
- [x] `pnpm build` â€” succeeds
- [x] Smoke test: browse `/collections`, open a product, add to cart, complete checkout â†’ lands on `wa.me` link

---

### 12.2 Phase 2 â€” Core UX

> **Branch:** `phase/2-core-ux`  
> **Commit message:** `feat: Phase 2 â€” Core UX complete`

**Goal:** Fully dynamic homepage, search, wishlist, account dashboard, responsive nav/footer, skeleton states.

#### Checklist

**Homepage**

- [ ] `app/(storefront)/page.tsx` â€” ISR 300s, orchestrates all home sections
- [ ] `components/home/HeroBanner.tsx` â€” carousel from Firestore `banners`
- [ ] `components/home/CollectionStrip.tsx` â€” franchise tile row
- [ ] `components/home/BrandStrip.tsx` â€” brand logo scroll
- [ ] `components/home/HomeSection.tsx` â€” titled product row (featured / bestseller)
- [ ] `components/home/HomeSectionList.tsx`
- [ ] `components/home/PromoGrid.tsx` â€” 4-tile promo banners
- [ ] `components/home/TestimonialsCarousel.tsx`
- [ ] `components/home/FAQAccordion.tsx`
- [ ] `lib/firebase/content.ts` â€” `getBanners()`, `getHomeSections()`, `getTestimonials()`, `getFAQ()`, `getAnnouncements()`
- [ ] `hooks/useSiteConfig.ts`

**Search**

- [ ] `app/(storefront)/search/page.tsx` â€” SSR, `?q=` param, ProductGrid, no-results state
- [ ] `app/(storefront)/search/loading.tsx`
- [ ] Firestore prefix query in `lib/firebase/products.ts#searchProducts()`

**Filters & Sort (collection page)**

- [ ] Full filter panel UX on `/collections/[slug]` â€” availability, price range, brand, sort
- [ ] URL param sync (`?brand=hot-toys&sort=price_asc&page=2`)

**Wishlist**

- [ ] `app/(storefront)/account/wishlist/page.tsx`
- [ ] Zustand wishlist persist + sync with Firestore on auth

**Account**

- [ ] `app/(storefront)/account/layout.tsx` â€” sidebar
- [ ] `app/(storefront)/account/page.tsx` â€” profile + coin balance
- [ ] `app/(storefront)/account/orders/page.tsx` â€” order list
- [ ] `app/(storefront)/account/addresses/page.tsx`
- [ ] `app/(storefront)/account/orders/[orderId]/page.tsx` â€” order detail
- [ ] `lib/firebase/users.ts` â€” `getUser()`, `updateUser()`, `addAddress()`, `removeAddress()`
- [ ] `lib/firebase/orders.ts` â€” `getUserOrders()`, `getOrder()`
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

- [ ] typecheck Â· lint Â· build pass
- [ ] Smoke test: homepage loads all sections; search works; wishlist syncs; account shows orders

---

### 12.3 Phase 3 â€” Order Tracking

> **Branch:** `phase/3-order-tracking`  
> **Commit message:** `feat: Phase 3 â€” Order Tracking complete`

**Goal:** Real-time order status visible to customers; admin can update status with WA notification.

#### Checklist

- [x] `app/(storefront)/orders/[orderId]/track/page.tsx` â€” vertical stepper, `onSnapshot`
- [x] `app/(storefront)/orders/[orderId]/track/loading.tsx`
- [x] `components/order/OrderStatusStepper.tsx`
- [x] `components/order/TrackingBanner.tsx`
- [x] `lib/firebase/orders.ts` â€” `updateOrderStatus()`, `releaseReservedStock()`
- [x] `hooks/useOrderStatusConfig.ts`
- [x] `app/api/admin/orders/[id]/status/route.ts` â€” PATCH (admin-only)
- [ ] Firestore `orderStatusConfig` seed documents (all 7 statuses)
- [x] Cloud Function stub: `onOrderStatusChange.ts` â€” dispatches WA notification
- [x] `components/admin/StatusChangeForm.tsx` â€” status dropdown (valid transitions only), note, AWB, WA preview

**Phase 3 gate**

- [x] typecheck Â· lint Â· build pass
- [ ] Smoke test: place order â†’ view `/orders/{id}/track` â†’ update status as admin â†’ customer stepper updates in real time

---

### 12.4 Phase 4 â€” Inventory via WhatsApp

> **Branch:** `phase/4-inventory-bot`  
> **Commit message:** `feat: Phase 4 â€” Inventory WhatsApp bot complete`

**Goal:** Admin can manage stock via WhatsApp text commands; passive low-stock alerts fire on product writes.

#### Checklist

- [x] `app/api/webhooks/whatsapp/route.ts` â€” HMAC verification, command dispatch
- [ ] `lib/whatsapp.ts` â€” `parseIncomingWebhook()`, `verifyWebhookSignature()`, `isAdminNumber()`, `buildHelpMessage()`
- [x] `lib/inventory.ts` â€” `parseRestockCommand()`, `parseStatusCommand()`, `buildLowStockAlertMessage()`, `buildSoldOutAlertMessage()`
- [x] Command handlers: RESTOCK, SOLDOUT, PREORDER, STATUS, STOCK, HELP
- [x] `functions/src/onProductWrite.ts` â€” recalc `availableStock`, alert logic
- [x] `functions/src/onOrderWrite.ts` â€” coins on delivered, release reserved stock on cancel/deliver
- [x] `functions/src/onUserCoinUpdate.ts` â€” guard negative balance
- [ ] Admin restock UI in `/admin/products/[id]` (Phase 6 page, but core logic here)
- [ ] Vitest integration test: webhook handler processes RESTOCK command correctly

**Phase 4 gate**

- [ ] typecheck Â· lint Â· build pass
- [ ] Local webhook test: POST to `/api/webhooks/whatsapp` with valid HMAC + RESTOCK payload â†’ Firestore updated

---

### 12.5 Phase 5 â€” Content & SEO

> **Branch:** `phase/5-content-seo`  
> **Commit message:** `feat: Phase 5 â€” Content & SEO complete`

**Goal:** Blog, policy pages, dynamic sitemap, metadata API, OG images, on-demand ISR.

#### Checklist

- [ ] `app/(storefront)/blog/page.tsx` â€” ISR 3600s, empty-state handling
- [ ] `app/(storefront)/blog/[slug]/page.tsx`
- [ ] `app/(storefront)/blog/[slug]/loading.tsx`
- [ ] `app/(storefront)/policies/[policy]/page.tsx` â€” ISR 3600s
- [ ] `app/(storefront)/[pageSlug]/page.tsx` â€” about, contact (ISR 3600s)
- [ ] `components/blog/PostCard.tsx`
- [ ] `components/blog/PostBody.tsx` â€” DOMPurify sanitised
- [ ] `lib/firebase/content.ts` â€” `getPage()`, `getBlogPost()`, `getAllBlogPosts()`
- [ ] `lib/seo.ts` â€” `generateProductMetadata()`, `generateCollectionMetadata()`, `generateBlogMetadata()`, `generateDefaultMetadata()`
- [ ] `app/api/revalidate/route.ts` â€” POST with secret token
- [ ] `app/api/sitemap/route.ts` â€” dynamic XML from Firestore slugs
- [ ] `app/sitemap.ts` â€” Next.js native sitemap (calls sitemap lib)
- [ ] `app/robots.ts` â€” robots.txt generation
- [ ] `functions/src/scheduledSitemapRebuild.ts` â€” Cloud Scheduler daily 2am IST

**Phase 5 gate**

- [ ] typecheck Â· lint Â· build pass
- [ ] Smoke test: `/blog`, `/policies/shipping-policy`, `/about`, `/contact` load correctly; `GET /api/sitemap` returns valid XML

---

### 12.6 Phase 6 â€” Admin Panel

> **Branch:** `phase/6-admin`  
> **Commit message:** `feat: Phase 6 â€” Admin Panel complete`

**Goal:** Full admin UI for every Firestore-backed entity.

#### Checklist

- [ ] `app/(admin)/layout.tsx` â€” auth guard (role=admin), sidebar
- [ ] `app/(admin)/admin/page.tsx` â€” dashboard (stats cards, recent orders, low-stock list)
- [ ] Products CRUD: list Â· new Â· edit Â· bulk-upload
- [ ] Orders: list (filters) Â· detail (status update, WA notify)
- [ ] Collections: list Â· new Â· edit Â· drag-to-reorder
- [ ] Content tabs: Banners Â· Sections Â· FAQs Â· Testimonials Â· Announcements
- [ ] Blog: post list Â· rich-text editor (Tiptap) Â· publish/unpublish
- [ ] Pages editor: terms Â· privacy Â· shipping Â· refund Â· about Â· contact
- [ ] Loyalty config editor + top holders + manual coin grant
- [ ] Discounts: list Â· new
- [ ] Config: `siteConfig` tabbed form
- [ ] `app/api/admin/products/bulk-upload/route.ts` â€” CSV â†’ Firestore batch write
- [ ] All admin forms use shared `components/admin/` components
- [ ] `components/admin/DraggableList.tsx` â€” generic drag-to-reorder
- [ ] `components/admin/CameraCapture.tsx` â€” device camera component
  - Image mode: live viewfinder (`getUserMedia`) â†’ capture still â†’ preview â†’ confirm/retake â†’ upload to Firebase Storage â†’ returns Storage URL
  - Video mode: start/stop recording (`MediaRecorder`) â†’ preview â†’ confirm/discard â†’ upload to Firebase Storage â†’ returns Storage URL
  - Graceful fallback: if `getUserMedia` unavailable (non-HTTPS or permissions denied), render `<input type="file" accept="image/*,video/*" capture="environment">` instead
  - Integrated into `ProductForm.tsx` image gallery field and new `videos[]` field
  - Integrated into `InventoryEditForm.tsx` for attaching restock condition photos
- [ ] `types/product.ts` â€” add `videos: string[]` to `Product` type
- [ ] `storage.rules` â€” allow authenticated admins to write to `products/*/videos/**`; enforce 100 MB max size for video objects

**Phase 6 gate**

- [ ] typecheck Â· lint Â· build pass
- [ ] Smoke test: create product â†’ appears in storefront (after ISR revalidate); update order status from admin â†’ stepper updates for customer

---

### 12.7 Phase 7 â€” Loyalty & Pre-orders

> **Branch:** `phase/7-loyalty`  
> **Commit message:** `feat: Phase 7 â€” Loyalty & Pre-orders complete`

**Goal:** FCC Coins earn/redeem, discount code system, pre-order badge and checkout flow.

#### Checklist

- [ ] `lib/loyalty.ts` â€” `calculateCoinsEarned()`, `calculateMaxRedeemable()`, `applyCoinsToOrder()`
- [ ] `lib/firebase/users.ts` â€” `awardCoins()`, `redeemCoins()`
- [ ] `lib/firebase/discounts.ts` â€” `validateDiscount()`, `incrementDiscountUsage()`
- [ ] Coin UI on checkout: `CoinRedeemToggle` fully wired
- [ ] Discount code UI on checkout: `DiscountCodeInput` fully wired
- [ ] Pre-order badge on `ProductCard`, `StockBadge`, product detail CTA
- [ ] Pre-order checkout: WhatsApp message prefixed "PRE-ORDER:"
- [ ] `components/account/CoinBalanceCard.tsx` â€” balance + history (coin history tab)
- [x] `functions/src/onOrderWrite.ts` â€” coins awarded on `delivered`
- [x] `functions/src/onUserCoinUpdate.ts` â€” negative balance guard
- [ ] Firestore `discounts` seed with sample codes
- [ ] Firestore `loyaltyConfig/main` seed

**Phase 7 gate**

- [ ] typecheck Â· lint Â· build pass
- [ ] Smoke test: add to cart â†’ apply discount â†’ redeem coins â†’ order placed â†’ delivered â†’ coins credited to account

---

## 13. Future Upgrades

| Upgrade                      | Effort | Notes                                                                         |
| ---------------------------- | ------ | ----------------------------------------------------------------------------- |
| **Razorpay payment gateway** | 1 wk   | Replace `/api/checkout` redirect target; order model stays identical          |
| **No-cost EMI**              | 3 days | Razorpay config param; show EMI calculator on product page                    |
| **Algolia search**           | 1 wk   | Mirror `products` collection to Algolia via Cloud Function; swap search route |
| **Push notifications**       | 3 days | Firebase Cloud Messaging for order status (replaces / augments WA notify)     |
| **Mobile app**               | â€”      | React Native + Expo; all Firebase lib functions are reusable                  |
| **B2B / bulk orders**        | 1 wk   | Separate order type, custom pricing tier field on users                       |
| **Multi-currency**           | 1 wk   | `siteConfig.currencies[]` + exchange rate field; display-only for now         |
| **Wishlist share**           | 2 days | Generate shareable link with wishlist snapshot                                |

---

_Document version: 1.2 â€” March 2026_
_All dynamic content fields editable by admin without code deployment._

