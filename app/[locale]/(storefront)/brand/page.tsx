import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllBrandsServer } from "@/lib/firebase/server";
import { ROUTES } from "@/constants/routes";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Browse by Brand",
  description: "Shop collectibles by brand — Hot Toys, Sideshow, Iron Studios, Prime 1 Studios, and many more.",
};

export default async function BrandsPage() {
  const brands = await getAllBrandsServer().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1
        className="font-comic mb-8 text-center"
        style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "var(--section-title-color)",
        }}
      >
        BROWSE BY BRAND
      </h1>

      {brands.length === 0 ? (
        <p className="text-center" style={{ color: "var(--color-muted)" }}>No brands available yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={ROUTES.BRAND(brand.slug)}
              className="group flex flex-col items-center gap-3 rounded-lg border-2 border-transparent p-4 transition-all hover:border-[#0D0D0D] hover:shadow-[3px_3px_0px_#0D0D0D]"
              style={{ background: "var(--card-bg)" }}
            >
              <div className="relative h-16 w-full opacity-60 grayscale transition group-hover:opacity-100 group-hover:grayscale-0">
                {brand.logoImage ? (
                  <Image
                    src={brand.logoImage}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="200px"
                  />
                ) : (
                  <span
                    className="flex h-full items-center justify-center text-sm font-bold"
                    style={{ color: "var(--card-text)" }}
                  >
                    {brand.name}
                  </span>
                )}
              </div>
              {brand.logoImage && (
                <span
                  className="text-center text-xs font-bold"
                  style={{ color: "var(--card-text)" }}
                >
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
