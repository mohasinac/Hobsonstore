import Image from "next/image";
import Link from "next/link";
import type { PromoBanner } from "@/types/content";

interface PromoGridProps {
  banners: PromoBanner[];
}

export function PromoGrid({ banners }: PromoGridProps) {
  if (banners.length === 0) return null;

  return (
    <section
      className="py-10"
      style={{
        background: "#FFFEF0",
        borderTop: "3px solid #0D0D0D",
        borderBottom: "3px solid #0D0D0D",
      }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <h2
          className="mb-6 text-center"
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            letterSpacing: "0.08em",
            color: "#0D0D0D",
          }}
        >
          HOT DEALS &amp; PROMOS
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {banners.slice(0, 4).map((banner) => (
            <Link
              key={banner.id}
              href={banner.ctaUrl}
              className="group relative overflow-hidden"
              style={{
                minHeight: 220,
                border: "3px solid #0D0D0D",
                boxShadow: "5px 5px 0px #0D0D0D",
                background: "#1A1A2E",
                display: "block",
                transition: "transform 0.12s ease, box-shadow 0.12s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translate(-2px,-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "7px 7px 0px #0D0D0D";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "5px 5px 0px #0D0D0D";
              }}
            >
              {banner.image && (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p
                  className="leading-tight"
                  style={{
                    fontFamily: "var(--font-bangers, Bangers, cursive)",
                    fontSize: "1.05rem",
                    letterSpacing: "0.06em",
                    color: "#FFE500",
                    textShadow: "2px 2px 0px #0D0D0D",
                  }}
                >
                  {banner.title}
                </p>
                <span
                  className="mt-1 inline-block text-xs font-bold uppercase"
                  style={{ color: "#FFFFFF" }}
                >
                  {banner.ctaLabel} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
