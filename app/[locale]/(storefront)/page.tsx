import type { Metadata } from "next";
import { getBannersServer, getHomeSectionsServer, getTestimonialsServer, getFAQServer, getPromoBannersServer, getAllFranchisesServer, getAllBrandsServer } from "@/lib/firebase/server";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FranchiseStrip } from "@/components/home/FranchiseStrip";
import { BrandStrip } from "@/components/home/BrandStrip";
import { HomeSectionList } from "@/components/home/HomeSectionList";
import { PromoGrid } from "@/components/home/PromoGrid";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Hobson Collectibles — Premium Action Figures & Statues",
  description:
    "India's premier destination for licensed action figures, statues, and pop-culture collectibles from Hot Toys, Sideshow, Iron Studios, and more.",
};

export default async function HomePage() {
  const [
    banners,
    franchises,
    brands,
    sections,
    promoBanners,
    testimonials,
    faqItems,
  ] = await Promise.all([
    getBannersServer().catch(() => []),
    getAllFranchisesServer().catch(() => []),
    getAllBrandsServer().catch(() => []),
    getHomeSectionsServer().catch(() => []),
    getPromoBannersServer().catch(() => []),
    getTestimonialsServer(true).catch(() => []),
    getFAQServer().catch(() => []),
  ]);

  return (
    <div>
      {/* Hero carousel */}
      <HeroBanner banners={banners} />

      {/* Franchise strip */}
      <FranchiseStrip franchises={franchises} />

      {/* Brand logo strip */}
      <BrandStrip brands={brands} />

      {/* Featured + Bestsellers rows */}
      <HomeSectionList sections={sections} />

      {/* Mid-page promo banners */}
      <PromoGrid banners={promoBanners} />

      {/* Testimonials */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* FAQ */}
      <FAQAccordion items={faqItems} />

      {/* Newsletter */}
      <section
        className="py-16"
        style={{
          background: "#FFE500",
          borderTop: "4px solid #0D0D0D",
        }}
      >
        <div className="mx-auto max-w-lg px-4 text-center">
          <h2
            className="mb-2"
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              letterSpacing: "0.08em",
              color: "#0D0D0D",
              textShadow: "3px 3px 0px rgba(0,0,0,0.15)",
            }}
          >
            STAY IN THE LOOP!
          </h2>
          <p
            className="mt-1 mb-6 text-sm font-semibold"
            style={{ color: "#1A1A2E" }}
          >
            Get first access to new arrivals, pre-orders &amp; exclusive deals.
          </p>
          <NewsletterSignup />
        </div>
      </section>
    </div>
  );
}
