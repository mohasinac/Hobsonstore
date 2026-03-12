export const COLLECTIONS = {
  // ─── Core commerce ────────────────────────────────────────────────────────
  PRODUCTS: "products",
  ORDERS: "orders",
  USERS: "users",
  // ─── Taxonomy (Spark plan: separate collections like categories/concerns) ─
  FRANCHISES: "franchises",          // franchise IPs (Marvel, DC, TMNT…)
  BRANDS: "brands",                  // manufacturer brands (Hot Toys, Sideshow…)
  CURATED_COLLECTIONS: "collections", // curated groupings (What's New, 1/6 Scale…)
  // ─── Storefront content ───────────────────────────────────────────────────
  BANNERS: "banners",
  HOME_SECTIONS: "homeSections",
  PROMO_BANNERS: "promobanners",
  ANNOUNCEMENTS: "announcements",
  TESTIMONIALS: "testimonials",
  FAQ: "faq",
  BLOG: "blog",
  PAGES: "pages",
  // ─── Commerce & engagement ────────────────────────────────────────────────
  DISCOUNTS: "discounts",
  REVIEWS: "reviews",
  REVIEW_FLAGS: "reviewFlags",
  SUPPORT_TICKETS: "supportTickets",
  NEWSLETTER_SIGNUPS: "newsletterSignups",
  // ─── Homepage features ──────────────────────────────────────────────────
  CHARACTER_HOTSPOT: "characterHotspot",
  TRUST_BADGES: "trustBadges",
  // ─── Config singletons ────────────────────────────────────────────────────
  LOYALTY_CONFIG: "loyaltyConfig",
  ORDER_STATUS_CONFIG: "orderStatusConfig",
  SITE_CONFIG: "siteConfig",
  PAYMENT_SETTINGS: "paymentSettings",
  SHIPPING_SETTINGS: "shippingSettings",
  NAVIGATION_CONFIG: "navigationConfig",
  INTEGRATION_KEYS: "integrationKeys",
} as const;
