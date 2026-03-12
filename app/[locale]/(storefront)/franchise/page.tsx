import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllFranchisesServer } from "@/lib/firebase/server";
import { ROUTES } from "@/constants/routes";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Browse by Franchise",
  description: "Shop collectibles from your favourite franchises — Marvel, DC, Star Wars, TMNT, and more.",
};

export default async function FranchisesPage() {
  const franchises = await getAllFranchisesServer().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1
        className="mb-8 text-center"
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          letterSpacing: "0.08em",
          color: "#0D0D0D",
        }}
      >
        BROWSE BY FRANCHISE
      </h1>

      {franchises.length === 0 ? (
        <p className="text-center text-gray-500">No franchises available yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {franchises.map((franchise) => (
            <Link
              key={franchise.slug}
              href={ROUTES.FRANCHISE(franchise.slug)}
              className="group flex flex-col items-center gap-2"
            >
              <div
                className="relative h-24 w-24 overflow-hidden bg-gray-100 transition-transform group-hover:-translate-y-1"
                style={{
                  border: "3px solid #0D0D0D",
                  boxShadow: "3px 3px 0px #0D0D0D",
                  borderRadius: "50%",
                }}
              >
                {franchise.thumbnailImage && (
                  <Image
                    src={franchise.thumbnailImage}
                    alt={franchise.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </div>
              <span
                className="max-w-[100px] text-center text-sm font-bold"
                style={{ color: "#1A1A2E" }}
              >
                {franchise.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
