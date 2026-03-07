import type { Timestamp } from "firebase/firestore";

export interface RestockEvent {
  qty: number;
  note?: string;
  restockedAt: Timestamp;
  restockedBy: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  salePrice: number;
  regularPrice: number;
  franchise: string;
  brand: string;
  tags: string[];
  description: string;
  specs: Record<string, string>;
  stock: number;
  reservedStock: number;
  availableStock: number;
  inStock: boolean;
  isPreorder: boolean;
  preorderShipDate?: string;
  lowStockThreshold: number;
  isFeatured: boolean;
  isBestseller: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastRestockedAt?: Timestamp;
  restockHistory: RestockEvent[];
}

export type ProductSortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "az"
  | "za"
  | "newest"
  | "oldest";

export interface ProductFilters {
  inStockOnly?: boolean;
  priceMin?: number;
  priceMax?: number;
  brand?: string;
  franchise?: string;
  sort?: ProductSortOption;
}
