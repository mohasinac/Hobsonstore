import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts } from "@/lib/firebase/products";
import { PriceTag } from "@/components/product/PriceTag";
import { StockBadge } from "@/components/product/StockBadge";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductSpecsTable } from "@/components/product/ProductSpecsTable";
import { RichTextRenderer } from "@/components/ui/RichTextRenderer";
import { AddToCartSection } from "./_components/AddToCartSection";
import { WishlistButton } from "./_components/WishlistButton";
import { ImageGallery } from "./_components/ImageGallery";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { generateProductMetadata } from "@/lib/seo";

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) return { title: "Product not found" };
  return generateProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) notFound();

  const related = await getRelatedProducts(product).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image Gallery */}
        <ImageGallery images={product.images} name={product.name} />

        {/* Product Info */}
        <div className="flex flex-col gap-4">
          {/* Breadcrumb brand */}
          {product.brand && (
            <Link
              href={ROUTES.COLLECTION(product.brand)}
              className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-red-600"
            >
              {product.brand.replace(/-/g, " ")}
            </Link>
          )}

          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          <PriceTag
            salePrice={product.salePrice}
            regularPrice={product.regularPrice}
            inStock={product.inStock}
            isPreorder={product.isPreorder}
          />

          <StockBadge
            inStock={product.inStock}
            isPreorder={product.isPreorder}
            availableStock={product.availableStock}
            lowStockThreshold={product.lowStockThreshold}
          />

          {product.isPreorder && product.preorderShipDate && (
            <p className="text-sm text-amber-700 font-medium">
              Estimated Ship Date: {product.preorderShipDate}
            </p>
          )}

          {product.description && (
            <RichTextRenderer html={product.description} />
          )}

          {/* Specs */}
          {Object.keys(product.specs ?? {}).length > 0 && (
            <ProductSpecsTable specs={product.specs} />
          )}

          {/* Add to cart area */}
          <AddToCartSection product={product} />

          {/* Wishlist */}
          <WishlistButton productId={product.id} />

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 border-t pt-4 text-xs text-gray-500">
            <span>🚚 Free Shipping</span>
            <span>💬 WhatsApp Support</span>
            <span>🪙 Earn FCC Coins</span>
            <span>🔒 Secure Checkout</span>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            You May Also Like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
