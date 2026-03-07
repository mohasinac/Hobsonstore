import type { Metadata } from "next";
import { getBanners, getHomeSections, getTestimonials, getFAQ, getPromoBanners } from "@/lib/firebase/content";
import { getActiveCollectionsByType } from "@/lib/firebase/collections";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CollectionStrip } from "@/components/home/CollectionStrip";
import { BrandStrip } from "@/components/home/BrandStrip";
import { HomeSectionList } from "@/components/home/HomeSectionList";
import { PromoGrid } from "@/components/home/PromoGrid";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "FatCat Collectibles — Premium Action Figures & Statues",
  description:
    "India's premier destination for licensed action figures, statues, and pop-culture collectibles from Hot Toys, Sideshow, Iron Studios, and more.",
};

export default async function HomePage() {
  const [
    banners,
    franchiseCollections,
    brandCollections,
    sections,
    promoBanners,
    testimonials,
    faqItems,
  ] = await Promise.all([
    getBanners().catch(() => []),
    getActiveCollectionsByType("franchise").catch(() => []),
    getActiveCollectionsByType("brand").catch(() => []),
    getHomeSections().catch(() => []),
    getPromoBanners().catch(() => []),
    getTestimonials(true).catch(() => []),
    getFAQ().catch(() => []),
  ]);

  return (
    <div>
      {/* Hero carousel */}
      <HeroBanner banners={banners} />

      {/* Franchise collection strip */}
      <CollectionStrip collections={franchiseCollections} />

      {/* Brand logo strip */}
      <BrandStrip brands={brandCollections} />

      {/* Featured + Bestsellers rows */}
      <HomeSectionList sections={sections} />

      {/* Mid-page promo banners */}
      <PromoGrid banners={promoBanners} />

      {/* Testimonials */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* FAQ */}
      <FAQAccordion items={faqItems} />

      {/* Newsletter */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Stay in the loop
          </h2>
          <p className="mt-2 mb-6 text-sm text-gray-500">
            Get first access to new arrivals, pre-orders, and exclusive deals.
          </p>
          <NewsletterSignup />
        </div>
      </section>
    </div>
  );
}
