import { getProducts } from "@/lib/firebase/products";
import { getCollection } from "@/lib/firebase/collections";
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
        // Look up the collection type to decide which field to filter by
        const col = await getCollection(section.collectionSlug).catch(
          () => null,
        );
        const filterKey =
          col?.type === "brand" ? "brand" : "franchise";
        const result = await getProducts(
          { [filterKey]: section.collectionSlug },
          section.itemLimit,
        ).catch(() => ({ products: [], lastDoc: null }));
        products = result.products;
      } else if (section.manualProductIds?.length) {
        const result = await getProducts({}, section.itemLimit).catch(() => ({
          products: [],
          lastDoc: null,
        }));
        products = result.products.filter((p) =>
          section.manualProductIds!.includes(p.id),
        );
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
