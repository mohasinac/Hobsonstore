import type { Metadata } from "next";
import type { Product } from "@/types/product";
import type { BlogPost, ContentPage } from "@/types/content";

const SITE_NAME = "Hobson Collectibles";
const DEFAULT_DESCRIPTION =
  "Premium collectibles — action figures, statues & pop-culture merchandise. Free shipping across India.";
const DEFAULT_OG_IMAGE = "/og-default.png";

export function generateDefaultMetadata(): Metadata {
  return {
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export function generateProductMetadata(product: Product): Metadata {
  const title = product.seoTitle ?? product.name;
  const description =
    product.seoDescription ??
    product.description.replace(/<[^>]+>/g, "").slice(0, 160);
  const image = product.images[0] ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: image, alt: product.name }],
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function generateCollectionMetadata(collection: {
  name: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  bannerImage?: string;
}): Metadata {
  const title = collection.seoTitle ?? collection.name;
  const description =
    collection.seoDescription ??
    collection.description ??
    `Shop ${collection.name} collectibles at Hobson Collectibles.`;
  const image = collection.bannerImage ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: image, alt: collection.name }],
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function generateBlogMetadata(post: BlogPost): Metadata {
  const title = post.seoTitle ?? post.title;
  const description =
    post.seoDescription ?? post.excerpt ?? post.body.replace(/<[^>]+>/g, "").slice(0, 160);
  const image = post.coverImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      images: [{ url: image, alt: post.title }],
      siteName: SITE_NAME,
      authors: [post.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function generatePageMetadata(page: ContentPage): Metadata {
  const title = page.seoTitle ?? page.title;
  const description =
    page.seoDescription ?? page.body.replace(/<[^>]+>/g, "").slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      siteName: SITE_NAME,
    },
  };
}
