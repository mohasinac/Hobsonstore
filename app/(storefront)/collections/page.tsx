import type { Metadata } from "next";
import { getAllCollections } from "@/lib/firebase/collections";
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
  const collections = await getAllCollections().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">All Collections</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {collections.map((col) => (
          <Link
            key={col.slug}
            href={ROUTES.COLLECTION(col.slug)}
            className="group flex flex-col items-center gap-2 rounded-lg border border-gray-100 p-3 text-center shadow-sm transition hover:shadow-md"
          >
            {col.bannerImage && (
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-50">
                <Image
                  src={col.bannerImage}
                  alt={col.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-xs font-medium text-gray-700 group-hover:text-red-600">
              {col.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
