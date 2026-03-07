import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import type { Collection } from "@/types/content";

interface CollectionStripProps {
  collections: Collection[];
}

export function CollectionStrip({ collections }: CollectionStripProps) {
  if (collections.length === 0) return null;

  return (
    <section className="overflow-hidden py-8">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-gray-500">
          Browse by Franchise
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {collections.map((col) => (
            <Link
              key={col.slug}
              href={ROUTES.COLLECTION(col.slug)}
              className="group flex flex-shrink-0 flex-col items-center gap-2"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-transparent bg-gray-100 transition group-hover:border-red-500">
                {col.bannerImage && (
                  <Image
                    src={col.bannerImage}
                    alt={col.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                )}
              </div>
              <span className="max-w-[80px] text-center text-xs font-medium text-gray-700 group-hover:text-red-600">
                {col.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
