/**
 * seed-data.ts
 *
 * Comprehensive seed data for Hobson Collectibles.
 * All records have fixed IDs so they can be safely upserted or deleted
 * without creating duplicates.
 *
 * Collections (Firestore document ID = slug):
 *   products, collections, banners, promobanners, homeSections,
 *   announcements, testimonials, faq, discounts, siteConfig, loyaltyConfig
 */

import type { Timestamp } from "firebase-admin/firestore";

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Sentinel – replaced by FieldValue.serverTimestamp() at write time */
const NOW = "__SERVER_TIMESTAMP__" as unknown as Timestamp;

// ─── Site Config ──────────────────────────────────────────────────────────────

export const SEED_SITE_CONFIG = {
  _docId: "main", // stored in siteConfig/main
  siteName: "Hobson Collectibles",
  siteTagline: "Premium Action Figures & Statues",
  logoUrl: "",
  faviconUrl: "",
  defaultOgImage: "/og-default.png",
  contactEmail: "support@hobsoncollectibles.in",
  whatsappCustomerCare: "919999999999",
  whatsappStatues: "919999999998",
  whatsappAdminBot: "919999999997",
  phoneCustomerCare: "+91 99999 99999",
  facebookUrl: "https://facebook.com/hobsoncollectibles",
  instagramUrl: "https://instagram.com/hobsoncollectibles",
  supportHours: "Mon–Sat, 10 AM – 7 PM IST",
  freeShippingMinimum: 2999,
  inventoryLowStockDefault: 3,
  noIndexAdmin: true,
  footerCopyright: "© 2026, HOBSON COLLECTIBLES",
  locations: [
    {
      city: "Pune",
      address: "Shop 12, Koregaon Park Annexe, Pune 411001",
      phone: "+91 98765 43210",
      mapUrl: "https://maps.google.com/?q=Koregaon+Park+Pune",
      active: true,
    },
    {
      city: "Bengaluru",
      address: "Unit 4, Indiranagar 100 Ft Road, Bengaluru 560038",
      phone: "+91 98765 43211",
      mapUrl: "https://maps.google.com/?q=Indiranagar+Bangalore",
      active: true,
    },
  ],
};

// ─── Loyalty Config ───────────────────────────────────────────────────────────

export const SEED_LOYALTY_CONFIG = {
  _docId: "main", // stored in loyaltyConfig/main
  coinsPerRupee: 0.01,
  rupeePerCoin: 1,
  minCoinsToRedeem: 100,
  maxRedeemPercent: 20,
  active: true,
};

// ─── Collections ──────────────────────────────────────────────────────────────

export const SEED_COLLECTIONS = [
  // Franchise collections
  {
    slug: "marvel",
    name: "Marvel",
    type: "franchise" as const,
    bannerImage: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
    logoImage: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=200&q=80",
    description: "Iconic Marvel super-heroes from Iron Man to Spider-Man.",
    seoTitle: "Marvel Collectibles — Hobson Collectibles",
    seoDescription: "Shop premium Marvel action figures and statues.",
    active: true,
    sortOrder: 1,
  },
  {
    slug: "dc",
    name: "DC Comics",
    type: "franchise" as const,
    bannerImage: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80",
    logoImage: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=200&q=80",
    description: "Collectibles from the DC universe — Batman, Superman, Wonder Woman & more.",
    active: true,
    sortOrder: 2,
  },
  {
    slug: "star-wars",
    name: "Star Wars",
    type: "franchise" as const,
    bannerImage: "https://images.unsplash.com/photo-1563656157432-67560011e209?w=400&q=80",
    description: "A galaxy far, far away — brought to life in stunning detail.",
    active: true,
    sortOrder: 3,
  },
  {
    slug: "anime",
    name: "Anime",
    type: "franchise" as const,
    bannerImage: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=400&q=80",
    description: "Dragon Ball Z, Demon Slayer, One Piece, Attack on Titan & more.",
    active: true,
    sortOrder: 4,
  },
  {
    slug: "game-of-thrones",
    name: "Game of Thrones",
    type: "franchise" as const,
    bannerImage: "https://images.unsplash.com/photo-1526400473556-aac12354f3db?w=400&q=80",
    description: "Seven Kingdoms collectibles — dragons, knights, and Iron Throne.",
    active: true,
    sortOrder: 5,
  },
  {
    slug: "warhammer",
    name: "Warhammer",
    type: "franchise" as const,
    bannerImage: "https://images.unsplash.com/photo-1526400473556-aac12354f3db?w=400&q=80",
    description: "Warhammer 40K and Age of Sigmar premium figures.",
    active: true,
    sortOrder: 6,
  },
  // Brand collections
  {
    slug: "hot-toys",
    name: "Hot Toys",
    type: "brand" as const,
    bannerImage: "https://images.unsplash.com/photo-1608889175638-9322300c46e8?w=400&q=80",
    logoImage: "https://images.unsplash.com/photo-1608889175638-9322300c46e8?w=200&q=80",
    description: "Sixth-scale masterpieces with hyper-realistic likenesses.",
    active: true,
    sortOrder: 7,
  },
  {
    slug: "sideshow",
    name: "Sideshow Collectibles",
    type: "brand" as const,
    bannerImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    logoImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",
    description: "World-class premium collectible statues and figures.",
    active: true,
    sortOrder: 8,
  },
  {
    slug: "iron-studios",
    name: "Iron Studios",
    type: "brand" as const,
    bannerImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
    logoImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80",
    description: "Brazilian craftsmen behind iconic 1:10 Battle Dioramas.",
    active: true,
    sortOrder: 9,
  },
  {
    slug: "mcfarlane",
    name: "McFarlane Toys",
    type: "brand" as const,
    bannerImage: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80",
    logoImage: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=200&q=80",
    description: "Highly detailed collector-grade action figures at accessible prices.",
    active: true,
    sortOrder: 10,
  },
  {
    slug: "bandai",
    name: "Bandai",
    type: "brand" as const,
    bannerImage: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=400&q=80",
    logoImage: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=200&q=80",
    description: "S.H.Figuarts, Metal Build, and other premium Bandai lines.",
    active: true,
    sortOrder: 11,
  },
  {
    slug: "threezero",
    name: "ThreeZero",
    type: "brand" as const,
    bannerImage: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&q=80",
    logoImage: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&q=80",
    description: "Iconic 1/6 and 1/12 scale collectibles with exceptional detail.",
    active: true,
    sortOrder: 12,
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────
// Fixed IDs ensure idempotent upsert/delete operations.

export const SEED_PRODUCTS = [
  // ── Hot Toys / Marvel ──────────────────────────────────────────────────────
  {
    id: "ht-iron-man-mk50",
    name: "Hot Toys Iron Man Mark L (MK50) 1/6 Scale Figure",
    slug: "hot-toys-iron-man-mark-l-mk50",
    images: [
      "https://images.unsplash.com/photo-1608889175638-9322300c46e8?w=800&q=80",
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
    ],
    salePrice: 32999,
    regularPrice: 36999,
    franchise: "marvel",
    brand: "hot-toys",
    tags: ["iron-man", "avengers", "hot-toys", "1/6-scale"],
    description:
      "<p>The iconic Iron Man Mark L armor from <em>Avengers: Infinity War</em>, faithfully recreated in 1/6 scale with die-cast leg armour, over 30 LED light features, and 25 interchangeable hands.</p><ul><li>Approx. 32 cm tall</li><li>Die-cast body parts</li><li>LED eyes &amp; chest arc reactor</li><li>30+ articulated points</li></ul>",
    specs: {
      Scale: "1/6",
      Height: "32 cm",
      Material: "ABS, Die-cast",
      Accessories: "30 interchangeable hands, nano particle effects",
      "LED Features": "Yes",
    },
    stock: 8,
    reservedStock: 0,
    availableStock: 8,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 3,
    isFeatured: true,
    isBestseller: true,
    active: true,
    videos: [],
    restockHistory: [],
  },
  {
    id: "ht-spiderman-ps4",
    name: "Hot Toys Spider-Man (Advanced Suit) PS4 1/6 Scale Figure",
    slug: "hot-toys-spider-man-advanced-suit-ps4",
    images: [
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80",
    ],
    salePrice: 28999,
    regularPrice: 31999,
    franchise: "marvel",
    brand: "hot-toys",
    tags: ["spider-man", "marvel", "hot-toys", "ps4", "1/6-scale"],
    description:
      "<p>Based on the critically acclaimed PlayStation 4 game, this sixth-scale figure features the Advanced Suit with accurate web pattern and 28 interchangeable hands.</p>",
    specs: { Scale: "1/6", Height: "30 cm", Material: "ABS plastic", Accessories: "28 hands, web accessories" },
    stock: 5,
    reservedStock: 0,
    availableStock: 5,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 2,
    isFeatured: true,
    isBestseller: false,
    active: true,
    videos: [],
    restockHistory: [],
  },
  {
    id: "ht-thor-endgame",
    name: "Hot Toys Thor (Avengers: Endgame) 1/6 Scale Figure",
    slug: "hot-toys-thor-avengers-endgame",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
    salePrice: 34499,
    regularPrice: 37999,
    franchise: "marvel",
    brand: "hot-toys",
    tags: ["thor", "avengers", "endgame", "hot-toys", "1/6-scale"],
    description:
      "<p>Fat Thor in his Endgame attire — complete with Stormbreaker, Mjolnir, and power effects.</p>",
    specs: { Scale: "1/6", Height: "33 cm", Material: "ABS plastic" },
    stock: 3,
    reservedStock: 0,
    availableStock: 3,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 2,
    isFeatured: false,
    isBestseller: true,
    active: true,
    videos: [],
    restockHistory: [],
  },
  // ── Hot Toys / DC ──────────────────────────────────────────────────────────
  {
    id: "ht-batman-arkham-knight",
    name: "Hot Toys Batman (Arkham Knight) 1/6 Scale Figure",
    slug: "hot-toys-batman-arkham-knight",
    images: [
      "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=800&q=80",
    ],
    salePrice: 29999,
    regularPrice: 33999,
    franchise: "dc",
    brand: "hot-toys",
    tags: ["batman", "dc", "arkham", "hot-toys", "1/6-scale"],
    description:
      "<p>The Dark Knight's Arkham Knight armored suit in stunning sixth-scale detail. Includes LED glowing eyes and 10 batarangs.</p>",
    specs: { Scale: "1/6", Height: "31 cm", Material: "ABS plastic, fabric suit" },
    stock: 6,
    reservedStock: 0,
    availableStock: 6,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 2,
    isFeatured: true,
    isBestseller: true,
    active: true,
    videos: [],
    restockHistory: [],
  },
  // ── Iron Studios / Marvel ─────────────────────────────────────────────────
  {
    id: "is-black-panther-bg",
    name: "Iron Studios Black Panther Battle Diorama 1/10 Scale",
    slug: "iron-studios-black-panther-battle-diorama",
    images: [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
    ],
    salePrice: 8999,
    regularPrice: 9999,
    franchise: "marvel",
    brand: "iron-studios",
    tags: ["black-panther", "wakanda", "iron-studios", "1/10-scale", "statue"],
    description:
      "<p>T'Challa in his iconic Black Panther suit, cast in polystone resin with a Wakanda-inspired base.</p>",
    specs: { Scale: "1/10", Height: "22 cm", Material: "Polystone resin" },
    stock: 12,
    reservedStock: 0,
    availableStock: 12,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 3,
    isFeatured: false,
    isBestseller: true,
    active: true,
    videos: [],
    restockHistory: [],
  },
  {
    id: "is-captain-america-mcu",
    name: "Iron Studios Captain America Deluxe 1/10 Scale",
    slug: "iron-studios-captain-america-deluxe",
    images: [
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80",
    ],
    salePrice: 7499,
    regularPrice: 8499,
    franchise: "marvel",
    brand: "iron-studios",
    tags: ["captain-america", "avengers", "iron-studios", "1/10-scale"],
    description: "<p>Steve Rogers mid-throw with his Vibranium shield. Based on Endgame design.</p>",
    specs: { Scale: "1/10", Height: "24 cm", Material: "Polystone resin" },
    stock: 15,
    reservedStock: 0,
    availableStock: 15,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 4,
    isFeatured: false,
    isBestseller: false,
    active: true,
    videos: [],
    restockHistory: [],
  },
  // ── Sideshow / DC ─────────────────────────────────────────────────────────
  {
    id: "ss-joker-premium",
    name: "Sideshow Joker Premium Format Figure",
    slug: "sideshow-joker-premium-format",
    images: [
      "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=800&q=80",
    ],
    salePrice: 74999,
    regularPrice: 82999,
    franchise: "dc",
    brand: "sideshow",
    tags: ["joker", "dc", "sideshow", "premium-format", "statue"],
    description:
      "<p>The Clown Prince of Crime stands over 56 cm in this iconic Premium Format collectible. Hand-finished polystone with fabric elements.</p>",
    specs: {
      Scale: "1/4",
      Height: "56 cm",
      Material: "Polystone, fabric, metal",
      "Edition Size": "1000",
    },
    stock: 2,
    reservedStock: 0,
    availableStock: 2,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 1,
    isFeatured: true,
    isBestseller: false,
    active: true,
    videos: [],
    restockHistory: [],
  },
  {
    id: "ss-superman-premium",
    name: "Sideshow Superman Premium Format Figure",
    slug: "sideshow-superman-premium-format",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
    salePrice: 84999,
    regularPrice: 94999,
    franchise: "dc",
    brand: "sideshow",
    tags: ["superman", "dc", "sideshow", "premium-format"],
    description:
      "<p>The Man of Steel mid-flight, sculpted in incredible detail. A centrepiece for any serious collection.</p>",
    specs: { Scale: "1/4", Height: "60 cm", Material: "Polystone, fabric" },
    stock: 0,
    reservedStock: 0,
    availableStock: 0,
    inStock: false,
    isPreorder: true,
    preorderShipDate: "Q3-2026",
    lowStockThreshold: 1,
    isFeatured: true,
    isBestseller: false,
    active: true,
    videos: [],
    restockHistory: [],
  },
  // ── Bandai / Anime ────────────────────────────────────────────────────────
  {
    id: "b-goku-shfiguarts",
    name: "Bandai S.H.Figuarts Son Goku -Fierce Battle-",
    slug: "bandai-shfiguarts-son-goku-fierce-battle",
    images: [
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80",
    ],
    salePrice: 4999,
    regularPrice: 5499,
    franchise: "anime",
    brand: "bandai",
    tags: ["dragon-ball-z", "goku", "bandai", "shfiguarts", "anime"],
    description:
      "<p>Highly articulated S.H.Figuarts Goku with energy effect parts and swap-out faces. Perfect for dynamic display poses.</p>",
    specs: { Scale: "1/12", Height: "14 cm", Accessories: "3 faces, 10 hands, Kamehameha effect" },
    stock: 20,
    reservedStock: 0,
    availableStock: 20,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 5,
    isFeatured: false,
    isBestseller: true,
    active: true,
    videos: [],
    restockHistory: [],
  },
  {
    id: "b-tanjiro-shfiguarts",
    name: "Bandai S.H.Figuarts Tanjiro Kamado",
    slug: "bandai-shfiguarts-tanjiro-kamado",
    images: [
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80",
    ],
    salePrice: 4499,
    regularPrice: 4999,
    franchise: "anime",
    brand: "bandai",
    tags: ["demon-slayer", "tanjiro", "bandai", "shfiguarts", "anime"],
    description: "<p>Tanjiro Kamado from Demon Slayer with Water Breathing effect parts. Features highly poseable joints.</p>",
    specs: { Scale: "1/12", Height: "15 cm", Accessories: "Water breathing effects, 2 faces" },
    stock: 18,
    reservedStock: 0,
    availableStock: 18,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 5,
    isFeatured: true,
    isBestseller: true,
    active: true,
    videos: [],
    restockHistory: [],
  },
  {
    id: "b-luffy-gear5-shfiguarts",
    name: "Bandai S.H.Figuarts Monkey D. Luffy (Gear 5)",
    slug: "bandai-shfiguarts-monkey-d-luffy-gear-5",
    images: [
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80",
    ],
    salePrice: 5299,
    regularPrice: 5799,
    franchise: "anime",
    brand: "bandai",
    tags: ["one-piece", "luffy", "gear-5", "bandai", "shfiguarts"],
    description: "<p>Sun God Nika form — Luffy's Gear 5 transformation with fluffy white hair and laugh-powered effects.</p>",
    specs: { Scale: "1/12", Height: "16 cm", Accessories: "Smile effect parts, 3 swap faces" },
    stock: 10,
    reservedStock: 0,
    availableStock: 10,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 3,
    isFeatured: true,
    isBestseller: false,
    active: true,
    videos: [],
    restockHistory: [],
  },
  // ── McFarlane / DC ────────────────────────────────────────────────────────
  {
    id: "mc-batman-three-jokers",
    name: "McFarlane Batman Three Jokers 7-inch Figure",
    slug: "mcfarlane-batman-three-jokers",
    images: [
      "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=800&q=80",
    ],
    salePrice: 2999,
    regularPrice: 3499,
    franchise: "dc",
    brand: "mcfarlane",
    tags: ["batman", "dc", "mcfarlane", "7-inch"],
    description: "<p>Batman in his classic Jim Lee-inspired armored suit from the Three Jokers storyline, with 22 points of articulation.</p>",
    specs: { Scale: "1/10 approx", Height: "18 cm", Accessories: "Batarang, display base" },
    stock: 25,
    reservedStock: 0,
    availableStock: 25,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 5,
    isFeatured: false,
    isBestseller: true,
    active: true,
    videos: [],
    restockHistory: [],
  },
  {
    id: "mc-spawn-classic",
    name: "McFarlane Spawn (Classic) 7-inch Figure",
    slug: "mcfarlane-spawn-classic",
    images: [
      "https://images.unsplash.com/photo-1526400473556-aac12354f3db?w=800&q=80",
    ],
    salePrice: 2499,
    regularPrice: 2999,
    franchise: "dc",
    brand: "mcfarlane",
    tags: ["spawn", "mcfarlane", "7-inch", "classic"],
    description: "<p>The original Spawn in his classic green-and-black suit. Todd McFarlane's creation in superb modern articulation.</p>",
    specs: { Scale: "1/10 approx", Height: "18 cm", Accessories: "Cape, chains" },
    stock: 30,
    reservedStock: 0,
    availableStock: 30,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 8,
    isFeatured: false,
    isBestseller: false,
    active: true,
    videos: [],
    restockHistory: [],
  },
  // ── ThreeZero / Star Wars ─────────────────────────────────────────────────
  {
    id: "tz-mandalorian-16",
    name: "ThreeZero The Mandalorian DLX 1/6 Scale Figure",
    slug: "threezero-mandalorian-dlx",
    images: [
      "https://images.unsplash.com/photo-1563656157432-67560011e209?w=800&q=80",
    ],
    salePrice: 18999,
    regularPrice: 20999,
    franchise: "star-wars",
    brand: "threezero",
    tags: ["mandalorian", "star-wars", "threezero", "dlx", "1/6-scale"],
    description:
      "<p>Mando with Beskar armour and Grogu (Baby Yoda) in a knapsack. Stunning 1/6 scale collectible with LED eyes.</p>",
    specs: { Scale: "1/6", Height: "30 cm", Accessories: "Grogu figure, blaster, rifle, Beskar spear" },
    stock: 7,
    reservedStock: 0,
    availableStock: 7,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 2,
    isFeatured: true,
    isBestseller: true,
    active: true,
    videos: [],
    restockHistory: [],
  },
  {
    id: "tz-darth-vader-dlx",
    name: "ThreeZero Darth Vader DLX 1/6 Scale Figure",
    slug: "threezero-darth-vader-dlx",
    images: [
      "https://images.unsplash.com/photo-1563656157432-67560011e209?w=800&q=80",
    ],
    salePrice: 19999,
    regularPrice: 21999,
    franchise: "star-wars",
    brand: "threezero",
    tags: ["darth-vader", "star-wars", "threezero", "dlx"],
    description: "<p>The Dark Lord of the Sith in Beskar-accurate detail. Red LED lightsaber and multiple hand options.</p>",
    specs: { Scale: "1/6", Height: "34 cm", Accessories: "Lightsaber (LED), 6 interchangeable hands" },
    stock: 4,
    reservedStock: 0,
    availableStock: 4,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 2,
    isFeatured: false,
    isBestseller: true,
    active: true,
    videos: [],
    restockHistory: [],
  },
  // ── Sideshow / Marvel (high-end) ──────────────────────────────────────────
  {
    id: "ss-wolverine-legendary",
    name: "Sideshow Wolverine Legendary Scale Figure",
    slug: "sideshow-wolverine-legendary-scale",
    images: [
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80",
    ],
    salePrice: 178999,
    regularPrice: 195999,
    franchise: "marvel",
    brand: "sideshow",
    tags: ["wolverine", "marvel", "sideshow", "legendary-scale", "statue"],
    description:
      "<p>Sideshow's largest-ever Wolverine at 1:2 scale — 68 cm of pure, clawed fury. Limited edition of 750.</p>",
    specs: {
      Scale: "1/2",
      Height: "68 cm",
      Material: "Polystone, metal claws",
      "Edition Size": "750",
    },
    stock: 1,
    reservedStock: 0,
    availableStock: 1,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 1,
    isFeatured: true,
    isBestseller: false,
    active: true,
    videos: [],
    restockHistory: [],
  },
  // ── Bandai / Anime (Preorder) ─────────────────────────────────────────────
  {
    id: "b-naruto-rikudo-shfiguarts",
    name: "Bandai S.H.Figuarts Naruto (Rikudō Sennin Mode)",
    slug: "bandai-shfiguarts-naruto-rikudo-sennin-mode",
    images: [
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80",
    ],
    salePrice: 5799,
    regularPrice: 6299,
    franchise: "anime",
    brand: "bandai",
    tags: ["naruto", "sage-mode", "bandai", "shfiguarts", "preorder"],
    description: "<p>Naruto in his most powerful form — Six Paths Sage Mode — with Truth-Seeking Orbs and Tailed Beast effects.</p>",
    specs: { Scale: "1/12", Height: "15 cm", Accessories: "Energy effects, 3 faces" },
    stock: 0,
    reservedStock: 0,
    availableStock: 0,
    inStock: false,
    isPreorder: true,
    preorderShipDate: "Q4-2026",
    lowStockThreshold: 5,
    isFeatured: false,
    isBestseller: false,
    active: true,
    videos: [],
    restockHistory: [],
  },
  {
    id: "is-thanos-bds",
    name: "Iron Studios Thanos BDS Art Scale 1/10",
    slug: "iron-studios-thanos-bds-art-scale",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
    salePrice: 9499,
    regularPrice: 10499,
    franchise: "marvel",
    brand: "iron-studios",
    tags: ["thanos", "avengers", "infinity-gauntlet", "iron-studios"],
    description: "<p>The Mad Titan holding the completed Infinity Gauntlet. Polystone diorama base featuring Titan rubble.</p>",
    specs: { Scale: "1/10", Height: "28 cm", Material: "Polystone resin" },
    stock: 9,
    reservedStock: 0,
    availableStock: 9,
    inStock: true,
    isPreorder: false,
    lowStockThreshold: 3,
    isFeatured: true,
    isBestseller: false,
    active: true,
    videos: [],
    restockHistory: [],
  },
];

// ─── Banners ──────────────────────────────────────────────────────────────────

export const SEED_BANNERS = [
  {
    id: "banner-001",
    title: "New Arrivals: Hot Toys 2026",
    subtitle: "Explore The Latest 1/6 Scale Masterpieces",
    ctaLabel: "Shop Now",
    ctaUrl: "/collections/hot-toys",
    backgroundImage: "https://images.unsplash.com/photo-1608889175638-9322300c46e8?w=1600&q=80",
    backgroundColor: "#1a1a2e",
    textColor: "#ffffff",
    sortOrder: 1,
    active: true,
  },
  {
    id: "banner-002",
    title: "Iron Studios Battle Dioramas",
    subtitle: "Museum-quality polystone statues from ₹6,999",
    ctaLabel: "Browse Collection",
    ctaUrl: "/collections/iron-studios",
    backgroundImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
    backgroundColor: "#2d1b69",
    textColor: "#ffffff",
    sortOrder: 2,
    active: true,
  },
  {
    id: "banner-003",
    title: "Pre-Order Now: Sideshow Superman",
    subtitle: "Limited edition. Secure yours before it sells out.",
    ctaLabel: "Pre-Order",
    ctaUrl: "/products/sideshow-superman-premium-format",
    backgroundImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
    backgroundColor: "#0d47a1",
    textColor: "#ffffff",
    sortOrder: 3,
    active: true,
  },
];

// ─── Promo Banners ────────────────────────────────────────────────────────────

export const SEED_PROMO_BANNERS = [
  {
    id: "promo-001",
    title: "Hot Toys Exclusives",
    ctaLabel: "Shop Hot Toys",
    ctaUrl: "/collections/hot-toys",
    image: "https://images.unsplash.com/photo-1608889175638-9322300c46e8?w=600&q=80",
    sortOrder: 1,
    active: true,
  },
  {
    id: "promo-002",
    title: "Anime Figures",
    ctaLabel: "Browse Anime",
    ctaUrl: "/collections/anime",
    image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80",
    sortOrder: 2,
    active: true,
  },
  {
    id: "promo-003",
    title: "Star Wars Collection",
    ctaLabel: "Explore",
    ctaUrl: "/collections/star-wars",
    image: "https://images.unsplash.com/photo-1563656157432-67560011e209?w=600&q=80",
    sortOrder: 3,
    active: true,
  },
  {
    id: "promo-004",
    title: "DC Universe",
    ctaLabel: "Shop DC",
    ctaUrl: "/collections/dc",
    image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=600&q=80",
    sortOrder: 4,
    active: true,
  },
];

// ─── Home Sections ────────────────────────────────────────────────────────────

export const SEED_HOME_SECTIONS = [
  {
    id: "home-featured",
    title: "Featured Products",
    subtitle: "Handpicked by our team",
    type: "featured" as const,
    itemLimit: 8,
    sortOrder: 1,
    active: true,
  },
  {
    id: "home-bestsellers",
    title: "Bestsellers",
    subtitle: "What everyone's buying",
    type: "bestseller" as const,
    itemLimit: 8,
    sortOrder: 2,
    active: true,
  },
  {
    id: "home-new-arrivals",
    title: "New Arrivals",
    subtitle: "Just landed",
    type: "new-arrivals" as const,
    itemLimit: 8,
    sortOrder: 3,
    active: true,
  },
  {
    id: "home-anime",
    title: "Anime Spotlight",
    collectionSlug: "anime",
    type: "custom" as const,
    itemLimit: 6,
    sortOrder: 4,
    active: true,
  },
];

// ─── Announcements ────────────────────────────────────────────────────────────

export const SEED_ANNOUNCEMENTS = [
  {
    id: "ann-001",
    message: "NO COST EMI ON ORDERS ABOVE ₹6,000 — Use code NOCOSTEMI at checkout",
    link: "/products",
    linkLabel: "Shop now",
    active: true,
    sortOrder: 1,
    bgColor: "#b91c1c",
    textColor: "#ffffff",
  },
  {
    id: "ann-002",
    message: "Hobson Bengaluru Store Now Open! Visit us at Indiranagar 100 Ft Road",
    link: "/policies/contact",
    linkLabel: "Get directions",
    active: true,
    sortOrder: 2,
    bgColor: "#1e40af",
    textColor: "#ffffff",
  },
  {
    id: "ann-003",
    message: "Pre-order Sideshow Superman Premium Format — Ships Q3 2026",
    link: "/products/sideshow-superman-premium-format",
    linkLabel: "Pre-order",
    active: true,
    sortOrder: 3,
    bgColor: "#065f46",
    textColor: "#ffffff",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const SEED_TESTIMONIALS = [
  {
    id: "t-001",
    name: "Arjun Mehta",
    rating: 5 as const,
    text: "Received my Hot Toys Iron Man perfectly packaged. The quality is phenomenal — Hobson is the only place I trust for high-end collectibles in India.",
    featured: true,
    sortOrder: 1,
    active: true,
  },
  {
    id: "t-002",
    name: "Priya Sharma",
    rating: 5 as const,
    text: "Ordered three Iron Studios statues and every single one arrived flawless. Their team answered all my questions within hours. Highly recommend!",
    featured: true,
    sortOrder: 2,
    active: true,
  },
  {
    id: "t-003",
    name: "Karthik Nair",
    rating: 4 as const,
    text: "Great range of Bandai S.H.Figuarts at competitive prices. Shipping was fast and secure. Will definitely be ordering again.",
    featured: true,
    sortOrder: 3,
    active: true,
  },
  {
    id: "t-004",
    name: "Divya Krishnan",
    rating: 5 as const,
    text: "The Sideshow Joker exceeded my expectations. Hobson's authentication guarantee gives you peace of mind when spending big.",
    featured: true,
    sortOrder: 4,
    active: true,
  },
  {
    id: "t-005",
    name: "Rohit Gupta",
    rating: 5 as const,
    text: "Best collectibles store in India, period. The Bengaluru store staff was incredibly knowledgeable and helped me pick the perfect piece.",
    featured: false,
    sortOrder: 5,
    active: true,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export const SEED_FAQ = [
  {
    id: "faq-001",
    question: "Are all products 100% authentic?",
    answer: "Yes. Hobson Collectibles is an authorised dealer for all brands we carry. Every product comes with the manufacturer's original packaging and certificate of authenticity where applicable.",
    sortOrder: 1,
    active: true,
  },
  {
    id: "faq-002",
    question: "Do you ship across India?",
    answer: "We ship to all serviceable pin codes across India. Orders above ₹2,999 qualify for free standard shipping. Express delivery options are available at checkout.",
    sortOrder: 2,
    active: true,
  },
  {
    id: "faq-003",
    question: "What is your return/exchange policy?",
    answer: "We accept returns within 7 days of delivery for items in original, unopened condition. Damaged-in-transit claims must be reported within 48 hours of delivery with photos. Please see our Refund Policy for full details.",
    sortOrder: 3,
    active: true,
  },
  {
    id: "faq-004",
    question: "How do I place a pre-order?",
    answer: "Pre-orders can be placed directly on the product page. Pre-order items require full payment upfront. You will be notified via WhatsApp and email as soon as your item ships.",
    sortOrder: 4,
    active: true,
  },
  {
    id: "faq-005",
    question: "What are Hobson Coins?",
    answer: "Hobson Coins is our loyalty rewards programme. You earn 1 coin for every ₹100 spent. Coins can be redeemed on future orders (up to 20% of the cart value, minimum 100 coins).",
    sortOrder: 5,
    active: true,
  },
  {
    id: "faq-006",
    question: "Can I cancel or modify an order?",
    answer: "Orders can be cancelled before they are shipped. To cancel or modify, contact us immediately via WhatsApp or email. Once shipped, orders cannot be modified.",
    sortOrder: 6,
    active: true,
  },
  {
    id: "faq-007",
    question: "Do you accept EMI payments?",
    answer: "Yes! We offer No Cost EMI on orders above ₹6,000 through major credit cards. Standard EMI options are available for all credit cards via our payment gateway.",
    sortOrder: 7,
    active: true,
  },
  {
    id: "faq-008",
    question: "Can I visit your physical store?",
    answer: "Absolutely! We have two stores — in Pune (Koregaon Park Annexe) and Bengaluru (Indiranagar). Store hours are Monday to Saturday, 10 AM to 7 PM IST.",
    sortOrder: 8,
    active: true,
  },
];

// ─── Discounts ────────────────────────────────────────────────────────────────

export const SEED_DISCOUNTS = [
  {
    id: "WELCOME10",    // Firestore doc ID = code
    code: "WELCOME10",
    type: "percent" as const,
    value: 10,
    minOrderValue: 999,
    maxUses: 500,
    usedCount: 0,
    active: true,
  },
  {
    id: "FLAT500",
    code: "FLAT500",
    type: "flat" as const,
    value: 500,
    minOrderValue: 3000,
    maxUses: 200,
    usedCount: 0,
    active: true,
  },
  {
    id: "HOBSON15",
    code: "HOBSON15",
    type: "percent" as const,
    value: 15,
    minOrderValue: 4999,
    maxUses: 100,
    usedCount: 0,
    active: true,
  },
  {
    id: "ANIME20",
    code: "ANIME20",
    type: "percent" as const,
    value: 20,
    minOrderValue: 2999,
    maxUses: 150,
    usedCount: 0,
    applicableCollections: ["anime"],
    active: true,
  },
];

// ─── Order Status Config ──────────────────────────────────────────────────────

export const SEED_ORDER_STATUS_CONFIG = [
  {
    id: "pending_payment",
    status: "pending_payment",
    label: "Pending Payment",
    color: "amber",
    notifyCustomer: false,
    waTemplate: "Hi {name}, your order #{orderId} is awaiting payment confirmation.",
    sortOrder: 1,
  },
  {
    id: "payment_confirmed",
    status: "payment_confirmed",
    label: "Payment Confirmed",
    color: "blue",
    notifyCustomer: true,
    waTemplate: "Hi {name}! Payment for order #{orderId} has been confirmed. We're processing your order now. 🎉",
    sortOrder: 2,
  },
  {
    id: "processing",
    status: "processing",
    label: "Processing",
    color: "blue",
    notifyCustomer: false,
    waTemplate: "Hi {name}, order #{orderId} is being prepared for dispatch.",
    sortOrder: 3,
  },
  {
    id: "shipped",
    status: "shipped",
    label: "Shipped",
    color: "purple",
    notifyCustomer: true,
    waTemplate: "Hi {name}! Your order #{orderId} has been shipped via {courier}. Track it here: {trackingUrl}",
    sortOrder: 4,
  },
  {
    id: "out_for_delivery",
    status: "out_for_delivery",
    label: "Out for Delivery",
    color: "orange",
    notifyCustomer: true,
    waTemplate: "Hi {name}! Your order #{orderId} is out for delivery today. Please keep your phone handy 📦",
    sortOrder: 5,
  },
  {
    id: "delivered",
    status: "delivered",
    label: "Delivered",
    color: "green",
    notifyCustomer: true,
    waTemplate: "Hi {name}! Order #{orderId} has been delivered. We hope you love your new collectible! ⭐ Share a photo and tag us!",
    sortOrder: 6,
  },
  {
    id: "cancelled",
    status: "cancelled",
    label: "Cancelled",
    color: "red",
    notifyCustomer: true,
    waTemplate: "Hi {name}, order #{orderId} has been cancelled. Refund (if any) will be processed within 5–7 business days.",
    sortOrder: 7,
  },
  {
    id: "refund_initiated",
    status: "refund_initiated",
    label: "Refund Initiated",
    color: "gray",
    notifyCustomer: true,
    waTemplate: "Hi {name}, refund for order #{orderId} has been initiated. Please allow 5–7 business days.",
    sortOrder: 8,
  },
];

// ─── Content Pages ────────────────────────────────────────────────────────────

export const SEED_PAGES = [
  {
    id: "about",
    slug: "about",
    title: "About Hobson Collectibles",
    body: `<h2>India's Premier Collectibles Store</h2>
<p>Hobson Collectibles was founded by passionate collectors for passionate collectors. With physical stores in Pune and Bengaluru, and nationwide shipping, we bring the world's finest licensed collectibles to Indian fans at fair prices.</p>
<h3>Our Promise</h3>
<ul>
  <li><strong>100% Authentic</strong> — Authorised dealer for all major brands</li>
  <li><strong>Secure Packaging</strong> — Every piece is triple-protected for transit</li>
  <li><strong>Expert Advice</strong> — Our team are collectors themselves</li>
  <li><strong>Loyalty Rewards</strong> — Earn Hobson Coins on every purchase</li>
</ul>
<h3>Brands We Carry</h3>
<p>Hot Toys, Sideshow Collectibles, Iron Studios, McFarlane Toys, Bandai, ThreeZero, Prime 1 Studio, XM Studios, and many more.</p>`,
    seoTitle: "About Us — Hobson Collectibles",
    seoDescription: "Learn about Hobson Collectibles — India's authorised dealer for premium action figures and statues.",
  },
  {
    id: "contact",
    slug: "contact",
    title: "Contact Us",
    body: `<h2>Get in Touch</h2>
<p>We'd love to hear from you! Reach us via any of the channels below.</p>
<h3>WhatsApp (Fastest Response)</h3>
<p>Send us a message on WhatsApp and we'll reply within hours: <a href="https://wa.me/919999999999">+91 99999 99999</a></p>
<h3>Email</h3>
<p><a href="mailto:support@hobsoncollectibles.in">support@hobsoncollectibles.in</a></p>
<h3>Store Locations</h3>
<p><strong>Pune:</strong> Shop 12, Koregaon Park Annexe, Pune 411001 — Mon–Sat 10 AM to 7 PM</p>
<p><strong>Bengaluru:</strong> Unit 4, Indiranagar 100 Ft Road, Bengaluru 560038 — Mon–Sat 10 AM to 7 PM</p>`,
    seoTitle: "Contact Us — Hobson Collectibles",
    seoDescription: "Contact Hobson Collectibles via WhatsApp, email, or visit our stores in Pune and Bengaluru.",
  },
];

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export const SEED_BLOG_POSTS = [
  {
    id: "blog-hot-toys-2026",
    title: "Hot Toys 2026 Line-Up: Everything You Need to Know",
    slug: "hot-toys-2026-lineup",
    coverImage: "https://images.unsplash.com/photo-1608889175638-9322300c46e8?w=1200&q=80",
    excerpt: "Hot Toys has unveiled their 2026 catalogue and it's packed with MCU, DC, and Star Wars gems.",
    body: `<h2>Hot Toys 2026: A Year of Epic Collectibles</h2>
<p>2026 is shaping up to be one of Hot Toys' most ambitious years yet. From the new Avengers wave to their expanded Star Wars line, there's something for every collector.</p>
<h3>Marvel Highlights</h3>
<p>The Iron Man Mark L gets an anniversary re-release with updated deco, and a new Spider-Man Symbiote variant has been confirmed for Q2. The Avengers Campus figures are particularly exciting for Disney Parks fans.</p>
<h3>DC Expansions</h3>
<p>Following the success of Batman Arkham Knight, Hot Toys is doubling down on the DC gaming line with a Gotham Knights Nightwing and a highly anticipated Deathstroke.</p>
<h3>Where to Pre-Order</h3>
<p>All 2026 Hot Toys figures are available for pre-order at Hobson Collectibles. Use code HOTNEW2026 for 5% off your first pre-order.</p>`,
    tags: ["hot-toys", "marvel", "dc", "star-wars", "2026"],
    authorName: "Hobson Team",
    published: true,
  },
  {
    id: "blog-beginners-guide",
    title: "Beginner's Guide to Collecting Action Figures in India",
    slug: "beginners-guide-collecting-action-figures-india",
    coverImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80",
    excerpt: "New to the hobby? We walk you through budgeting, brands, and what to look for when buying your first collectible.",
    body: `<h2>Welcome to the World of Collectibles</h2>
<p>Getting started with premium collectibles can feel overwhelming. Here's everything you need to know to buy smart from day one.</p>
<h3>Setting a Budget</h3>
<p>Entry-level collectibles start around ₹1,999 (McFarlane 7-inch figures). Mid-tier pieces from Iron Studios or Bandai S.H.Figuarts range from ₹4,000–₹12,000. High-end Hot Toys and Sideshow figures run ₹20,000–₹80,000+.</p>
<h3>Choosing Your First Piece</h3>
<p>Start with a character you absolutely love. A collectible you're emotionally invested in will always be worth it, regardless of resale value.</p>
<h3>Authenticity Check</h3>
<p>Always buy from an authorised dealer like Hobson Collectibles. Check for: official brand stickers, original inner box, numbered certificates, and country-of-origin labels.</p>
<h3>Storage & Display</h3>
<p>Keep figures away from direct sunlight to prevent discolouration. Use UV-filtering display cases for premium pieces.</p>`,
    tags: ["guide", "beginner", "tips", "collecting"],
    authorName: "Hobson Team",
    published: true,
  },
  {
    id: "blog-anime-figures-2026",
    title: "Top 10 Anime Figures to Buy in 2026",
    slug: "top-10-anime-figures-2026",
    coverImage: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1200&q=80",
    excerpt: "From Demon Slayer to One Piece Gear 5 — the anime figures every collector should own in 2026.",
    body: `<h2>The Best Anime Collectibles of 2026</h2>
<p>Anime collectibles have never been hotter. Here are the must-have pieces for this year.</p>
<h3>1. Luffy Gear 5 — Bandai S.H.Figuarts</h3>
<p>Sun God Nika form is finally here in S.H.Figuarts quality. Incredible laugh-effect parts and articulation that lets you recreate every iconic moment.</p>
<h3>2. Tanjiro Kamado Water Breathing — Bandai S.H.Figuarts</h3>
<p>The detail on the water breathing effects is stunning. This is easily the best Tanjiro figure on the market.</p>
<h3>3. Naruto Rikudō Sennin Mode — Bandai S.H.Figuarts</h3>
<p>Available on pre-order now, this Naruto figure in Six Paths Sage Mode is set to be the definitive Naruto collectible.</p>
<p>Check out our full <a href="/collections/anime">Anime collection</a> for all available and pre-order items.</p>`,
    tags: ["anime", "dragon-ball-z", "demon-slayer", "one-piece", "naruto", "2026"],
    authorName: "Hobson Team",
    published: true,
  },
];

// ─── Franchises ───────────────────────────────────────────────────────────────

export const SEED_FRANCHISES = [
  {
    slug: "marvel",
    name: "Marvel",
    bannerImage: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80",
    logoImage: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=200&q=80",
    description: "Iconic Marvel super-heroes from Iron Man to Spider-Man.",
    seoTitle: "Marvel Collectibles — Hobson Collectibles",
    seoDescription: "Shop premium Marvel action figures and statues.",
    active: true,
    sortOrder: 1,
  },
  {
    slug: "dc",
    name: "DC Comics",
    bannerImage: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=800&q=80",
    logoImage: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=200&q=80",
    description: "Collectibles from the DC universe — Batman, Superman, Wonder Woman & more.",
    active: true,
    sortOrder: 2,
  },
  {
    slug: "star-wars",
    name: "Star Wars",
    bannerImage: "https://images.unsplash.com/photo-1563656157432-67560011e209?w=800&q=80",
    description: "A galaxy far, far away — brought to life in stunning detail.",
    active: true,
    sortOrder: 3,
  },
  {
    slug: "anime",
    name: "Anime",
    bannerImage: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80",
    description: "Dragon Ball Z, Demon Slayer, One Piece, Attack on Titan & more.",
    active: true,
    sortOrder: 4,
  },
  {
    slug: "game-of-thrones",
    name: "Game of Thrones",
    bannerImage: "https://images.unsplash.com/photo-1526400473556-aac12354f3db?w=800&q=80",
    description: "Seven Kingdoms collectibles — dragons, knights, and Iron Throne.",
    active: true,
    sortOrder: 5,
  },
  {
    slug: "warhammer",
    name: "Warhammer",
    bannerImage: "https://images.unsplash.com/photo-1526400473556-aac12354f3db?w=800&q=80",
    description: "Warhammer 40K and Age of Sigmar premium figures.",
    active: true,
    sortOrder: 6,
  },
];

// ─── Brands ───────────────────────────────────────────────────────────────────

export const SEED_BRANDS = [
  {
    slug: "hot-toys",
    name: "Hot Toys",
    bannerImage: "https://images.unsplash.com/photo-1608889175638-9322300c46e8?w=800&q=80",
    logoImage: "https://images.unsplash.com/photo-1608889175638-9322300c46e8?w=200&q=80",
    description: "Sixth-scale masterpieces with hyper-realistic likenesses.",
    active: true,
    sortOrder: 1,
  },
  {
    slug: "sideshow",
    name: "Sideshow Collectibles",
    bannerImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    logoImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",
    description: "World-class premium collectible statues and figures.",
    active: true,
    sortOrder: 2,
  },
  {
    slug: "iron-studios",
    name: "Iron Studios",
    bannerImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
    logoImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80",
    description: "Brazilian craftsmen behind iconic 1:10 Battle Dioramas.",
    active: true,
    sortOrder: 3,
  },
  {
    slug: "mcfarlane",
    name: "McFarlane Toys",
    bannerImage: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=800&q=80",
    logoImage: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=200&q=80",
    description: "Highly detailed collector-grade action figures at accessible prices.",
    active: true,
    sortOrder: 4,
  },
  {
    slug: "bandai",
    name: "Bandai",
    bannerImage: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80",
    logoImage: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=200&q=80",
    description: "S.H.Figuarts, Metal Build, and other premium Bandai lines.",
    active: true,
    sortOrder: 5,
  },
  {
    slug: "threezero",
    name: "ThreeZero",
    bannerImage: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&q=80",
    logoImage: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&q=80",
    description: "Iconic 1/6 and 1/12 scale collectibles with exceptional detail.",
    active: true,
    sortOrder: 6,
  },
];

// ─── Curated Collections ──────────────────────────────────────────────────────

export const SEED_CURATED_COLLECTIONS = [
  {
    slug: "whats-new",
    name: "What's New",
    description: "The latest arrivals and freshest releases at Hobson.",
    active: true,
    sortOrder: 1,
  },
  {
    slug: "16-scale",
    name: "1/6 Scale",
    description: "Premium sixth-scale figures from Hot Toys, ThreeZero, and more.",
    active: true,
    sortOrder: 2,
  },
  {
    slug: "110-scale",
    name: "1/10 Scale",
    description: "BDS Art Scale and Battle Diorama figures from Iron Studios.",
    active: true,
    sortOrder: 3,
  },
  {
    slug: "preorder",
    name: "Pre-order",
    description: "Secure yours before it sells out — ships on release.",
    active: true,
    sortOrder: 4,
  },
  {
    slug: "statues",
    name: "Statues & Dioramas",
    description: "Premium polystone and resin statues from Sideshow and Iron Studios.",
    active: true,
    sortOrder: 5,
  },
  {
    slug: "under-5000",
    name: "Under ₹5,000",
    description: "High-quality collectibles at approachable price points.",
    active: true,
    sortOrder: 6,
  },
];

// ─── Payment Settings (singleton) ────────────────────────────────────────────

export const SEED_PAYMENT_SETTINGS = {
  _docId: "main",
  razorpayEnabled: false,
  razorpayKeyId: "",
  razorpayKeySecret: "",
  codEnabled: true,
  codFee: 0,
  codMaxOrderValue: 10000,
  whatsappEnabled: true,
  whatsappNumber: "919999999999",
  upiId: "",
  bankName: "",
  bankAccountNumber: "",
  bankIfsc: "",
  bankAccountHolder: "",
  paymentNote: "We accept UPI, cards, net banking, and COD.",
};

// ─── Shipping Settings (singleton) ────────────────────────────────────────────

export const SEED_SHIPPING_SETTINGS = {
  _docId: "main",
  freeShippingThreshold: 2999,
  standardShippingFee: 99,
  expressShippingFee: 299,
  gstPercent: 18,
  codFee: 0,
  shippingNote: "Free pan-India shipping on all orders above ₹2,999.",
  estimatedDeliveryDays: "3–7",
  expressDeliveryDays: "1–2",
  nonServiceablePincodes: [] as string[],
};

// ─── Navigation Config (singleton) ────────────────────────────────────────────

export const SEED_NAVIGATION_CONFIG = {
  _docId: "main",
  featuredFranchises: ["marvel", "dc", "star-wars", "anime"],
  featuredBrands: ["hot-toys", "sideshow", "iron-studios", "mcfarlane"],
  maxMegaMenuItems: 8,
  showBrandsInNav: true,
  showFranchisesInNav: true,
  showBlogInNav: true,
};

// ─── All seed entity IDs (for the admin seeding page) ────────────────────────

export const SEED_ENTITY_MAP = {
  products: SEED_PRODUCTS.map((p) => p.id),
  collections: SEED_COLLECTIONS.map((c) => c.slug),
  franchises: SEED_FRANCHISES.map((f) => f.slug),
  brands: SEED_BRANDS.map((b) => b.slug),
  curatedCollections: SEED_CURATED_COLLECTIONS.map((c) => c.slug),
  banners: SEED_BANNERS.map((b) => b.id),
  promobanners: SEED_PROMO_BANNERS.map((b) => b.id),
  homeSections: SEED_HOME_SECTIONS.map((s) => s.id),
  announcements: SEED_ANNOUNCEMENTS.map((a) => a.id),
  testimonials: SEED_TESTIMONIALS.map((t) => t.id),
  faq: SEED_FAQ.map((f) => f.id),
  discounts: SEED_DISCOUNTS.map((d) => d.id),
  orderStatusConfig: SEED_ORDER_STATUS_CONFIG.map((s) => s.id),
  pages: SEED_PAGES.map((p) => p.id),
  blogPosts: SEED_BLOG_POSTS.map((b) => b.id),
  // singletons — seeded by docId
  siteConfig: ["main"],
  loyaltyConfig: ["main"],
  paymentSettings: ["main"],
  shippingSettings: ["main"],
  navigationConfig: ["main"],
};
