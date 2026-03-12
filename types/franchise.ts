export interface Franchise {
  slug: string;
  name: string;
  thumbnailImage?: string;  // for FranchiseStrip nav tile + /franchise index grid
  bannerImage?: string;     // for /franchise/[slug] page header
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  active: boolean;
}
