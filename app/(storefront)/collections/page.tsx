import type { Metadata } from "next";
import { getAllCollectionsServer } from "@/lib/firebase/server";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse all Hobson Collectibles franchise and brand collections.",
};

export default async function CollectionsPage() {
  const collections = await getAllCollectionsServer().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1
        className="mb-8"
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          letterSpacing: "0.08em",
          color: "#0D0D0D",
        }}
      >
        ALL COLLECTIONS
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {collections.map((col) => (
          <Link
            key={col.slug}
            href={ROUTES.COLLECTION(col.slug)}
            className="group flex flex-col items-center gap-2 p-3 text-center transition-transform hover:-translate-y-1"
            style={{
              border: "2px solid #0D0D0D",
              boxShadow: "3px 3px 0px #0D0D0D",
              background: "#FFFFFF",
            }}
          >
            {col.bannerImage && (
              <div
                className="relative h-16 w-16 overflow-hidden"
                style={{ borderRadius: "50%", border: "2px solid #0D0D0D" }}
              >
                <Image
                  src={col.bannerImage}
                  alt={col.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-xs font-bold" style={{ color: "#1A1A2E" }}>
              {col.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
