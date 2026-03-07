import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductServer, getRelatedProductsServer } from "@/lib/firebase/server";
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
  const product = await getProductServer(slug).catch(() => null);
  if (!product) return { title: "Product not found" };
  return generateProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductServer(slug).catch(() => null);
  if (!product) notFound();

  const related = await getRelatedProductsServer(product).catch(() => []);

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
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: "#E8001C", letterSpacing: "0.1em" }}
            >
              {product.brand.replace(/-/g, " ")}
            </Link>
          )}

          <h1
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              letterSpacing: "0.05em",
              color: "#0D0D0D",
            }}
          >
            {product.name.toUpperCase()}
          </h1>

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
          <div
            className="flex flex-wrap gap-3 pt-4 text-xs font-bold"
            style={{ borderTop: "2px solid #0D0D0D", color: "#1A1A2E" }}
          >
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
          <h2
            className="mb-6"
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
              letterSpacing: "0.06em",
              color: "#0D0D0D",
            }}
          >
            YOU MAY ALSO LIKE
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
