import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getBrandServer, getProductsServer } from "@/lib/firebase/server";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilterSidebar } from "@/components/product/ProductFilterSidebar";
import { generateCollectionMetadata } from "@/lib/seo";

export const revalidate = 300;

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    franchise?: string;
    inStock?: string;
    priceMin?: string;
    priceMax?: string;
  }>;
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandServer(slug).catch(() => null);
  if (!brand) return { title: "Brand not found" };
  return generateCollectionMetadata(brand);
}

export default async function BrandPage({
  params,
  searchParams,
}: BrandPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const brand = await getBrandServer(slug).catch(() => null);
  if (!brand) notFound();

  const products = await getProductsServer({
    brand: slug,
    franchise: sp.franchise,
    inStock: sp.inStock === "true" ? true : undefined,
    sort: (sp.sort as "price_asc" | "price_desc" | "newest" | "name_asc") ?? "newest",
    priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
    priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
  }).catch(() => []);

  return (
    <div>
      {/* Brand banner */}
      {brand.bannerImage && (
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "clamp(160px, 28vw, 340px)", borderBottom: "3px solid #0D0D0D" }}
        >
          <Image
            src={brand.bannerImage}
            alt={brand.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0 flex items-end p-6"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }}
          >
            <h1
              style={{
                fontFamily: "var(--font-bangers, Bangers, cursive)",
                fontSize: "clamp(2rem, 6vw, 4rem)",
                letterSpacing: "0.06em",
                color: "#FFE500",
                textShadow: "3px 3px 0px #0D0D0D",
              }}
            >
              {brand.name}
            </h1>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        {!brand.bannerImage && (
          <h1
            className="mb-6"
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              letterSpacing: "0.06em",
              color: "#0D0D0D",
            }}
          >
            {brand.name}
          </h1>
        )}
        {brand.description && (
          <p className="mb-6" style={{ color: "#6B6B6B" }}>{brand.description}</p>
        )}
        <p className="mb-6 text-sm font-semibold" style={{ color: "#6B6B6B" }}>{products.length} products</p>

        <div className="flex flex-col gap-8 md:flex-row">
          <div className="w-full md:w-56 shrink-0">
            <ProductFilterSidebar />
          </div>
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
