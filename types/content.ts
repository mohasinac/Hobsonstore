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

export interface Collection {
  slug: string;
  name: string;
  type: "franchise" | "brand";
  bannerImage: string;
  logoImage?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  active: boolean;
}
