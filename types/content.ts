import type { Timestamp } from "firebase/firestore";

export interface Banner {
  id: string;
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

export interface PromoBanner {
  id: string;
  title: string;
  ctaLabel: string;
  ctaUrl: string;
  image: string;
  sortOrder: number;
  active: boolean;
}

export interface HomeSection {
  id: string;
  title: string;
  subtitle?: string;
  collectionSlug?: string;
  manualProductIds?: string[];
  itemLimit: number;
  sortOrder: number;
  active: boolean;
  type: "featured" | "bestseller" | "new-arrivals" | "custom";
}

export interface Announcement {
  id: string;
  message: string;
  link?: string;
  linkLabel?: string;
  active: boolean;
  sortOrder: number;
  bgColor?: string;
  textColor?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  avatarUrl?: string;
  featured: boolean;
  sortOrder: number;
  active: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  body: string;
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

export interface ContentPage {
  slug: string;
  title: string;
  body: string;
  updatedAt: Timestamp;
  seoTitle?: string;
  seoDescription?: string;
}

/** Curated/featured groupings only (What's New, 1/6 Scale, Action Figures, etc.).
 *  Franchise IPs → `types/franchise.ts`  |  Brands → `types/brand.ts`
 */
export interface Collection {
  slug: string;
  name: string;
  bannerImage?: string;
  description?: string;
  /** Auto-filter: products whose franchise slug is in this list are included */
  filterFranchises?: string[];
  /** Auto-filter: products whose brand slug is in this list are included */
  filterBrands?: string[];
  /** Auto-filter: products that have any of these tags are included */
  filterTags?: string[];
  /** OR: handpick specific product IDs */
  manualProductIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  active: boolean;
}
