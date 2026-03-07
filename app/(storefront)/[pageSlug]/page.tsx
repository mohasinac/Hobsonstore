import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageServer } from "@/lib/firebase/server";
import { RichTextRenderer } from "@/components/ui/RichTextRenderer";
import { generatePageMetadata } from "@/lib/seo";

export const revalidate = 3600;

// Only serve known info pages through this catch-all.
// Everything else 404s to prevent arbitrary URL matches conflicting with
// the storefront route group's more specific routes.
const VALID_PAGE_SLUGS = ["about", "contact"] as const;
type PageSlug = (typeof VALID_PAGE_SLUGS)[number];

const PAGE_TITLES: Record<PageSlug, string> = {
  about: "About Us",
  contact: "Contact Us",
};

interface Props {
  params: Promise<{ pageSlug: string }>;
}

export async function generateStaticParams() {
  return VALID_PAGE_SLUGS.map((pageSlug) => ({ pageSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageSlug } = await params;
  if (!VALID_PAGE_SLUGS.includes(pageSlug as PageSlug)) {
    return { title: "Not Found" };
  }
  const page = await getPageServer(pageSlug).catch(() => null);
  if (page) return generatePageMetadata(page);
  return { title: PAGE_TITLES[pageSlug as PageSlug] ?? pageSlug };
}

export default async function InfoPage({ params }: Props) {
  const { pageSlug } = await params;
  if (!VALID_PAGE_SLUGS.includes(pageSlug as PageSlug)) notFound();

  const page = await getPageServer(pageSlug).catch(() => null);
  const title = page?.title ?? PAGE_TITLES[pageSlug as PageSlug] ?? pageSlug;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">{title}</h1>
      {page?.body ? (
        <RichTextRenderer html={page.body} />
      ) : (
        <p className="text-gray-500">
          Content for this page is coming soon.
        </p>
      )}
    </div>
  );
}
