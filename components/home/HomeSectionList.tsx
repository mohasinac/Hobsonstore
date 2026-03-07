import { getCollectionServer, getProductsServer, getProductsByIdsServer } from "@/lib/firebase/server";
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
      if (section.collectionSlug) {
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
