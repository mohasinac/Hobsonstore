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
    <section
      className="overflow-hidden py-10"
      style={{ background: "#FFFEF0", borderBottom: "3px solid #0D0D0D" }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <h2
          className="mb-6 text-center"
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
            letterSpacing: "0.1em",
            color: "#0D0D0D",
          }}
        >
          BROWSE BY FRANCHISE
        </h2>
        <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
          {collections.map((col) => (
            <Link
              key={col.slug}
              href={ROUTES.COLLECTION(col.slug)}
              className="group flex flex-shrink-0 flex-col items-center gap-2"
            >
              <div
                className="relative h-[76px] w-[76px] overflow-hidden bg-gray-100 transition-transform group-hover:-translate-y-1"
                style={{
                  border: "3px solid #0D0D0D",
                  boxShadow: "3px 3px 0px #0D0D0D",
                  borderRadius: "50%",
                }}
              >
                {col.bannerImage && (
                  <Image
                    src={col.bannerImage}
                    alt={col.name}
                    fill
                    className="object-cover"
                    sizes="76px"
                  />
                )}
              </div>
              <span
                className="max-w-[84px] text-center text-xs font-bold transition-colors"
                style={{ color: "#1A1A2E" }}
              >
                {col.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
