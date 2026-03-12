export interface Brand {
  slug: string;
  name: string;
  logoImage?: string;    // for BrandStrip horizontal scroll
  bannerImage?: string;  // for /brand/[slug] page header
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  active: boolean;
}
