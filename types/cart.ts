export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  salePrice: number;
  qty: number;
  isPreorder: boolean;
}
