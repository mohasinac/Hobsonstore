import { getCollectionServer, getProductsServer, getProductsByIdsServer, getFeaturedProductsServer, getBestsellerProductsServer, getNewArrivalsProductsServer } from "@/lib/firebase/server";
import { HomeSection } from "./HomeSection";
import type { HomeSection as HomeSectionType } from "@/types/content";
import type { Product } from "@/types/product";

interface HomeSectionListProps {
  sections: HomeSectionType[];
}

export async function HomeSectionList({ sections }: HomeSectionListProps) {
  const rendered = await Promise.all(
    sections.map(async (section) => {
      let products: Product[] = [];
      if (section.type === "featured") {
        products = await getFeaturedProductsServer(section.itemLimit).catch(() => []);
      } else if (section.type === "bestseller") {
        products = await getBestsellerProductsServer(section.itemLimit).catch(() => []);
      } else if (section.type === "new-arrivals") {
        products = await getNewArrivalsProductsServer(section.itemLimit).catch(() => []);
      } else if (section.collectionSlug) {
        const col = await getCollectionServer(section.collectionSlug).catch(() => null);
        const filterKey = col?.type === "brand" ? "brand" : "franchise";
        products = await getProductsServer(
          { [filterKey]: section.collectionSlug },
          section.itemLimit,
        ).catch(() => []);
      } else if (section.manualProductIds?.length) {
        products = await getProductsByIdsServer(section.manualProductIds).catch(() => []);
      }
      return { section, products };
    }),
  );

  return (
    <>
      {rendered.map(({ section, products }) => (
        <HomeSection key={section.id} section={section} products={products} />
      ))}
    </>
  );
}
