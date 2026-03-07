import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageServer } from "@/lib/firebase/server";
import { RichTextRenderer } from "@/components/ui/RichTextRenderer";
import { generatePageMetadata } from "@/lib/seo";

export const revalidate = 3600;

const VALID_POLICIES = [
  "terms-of-service",
  "privacy-policy",
  "shipping-policy",
  "refund-policy",
] as const;

type PolicySlug = (typeof VALID_POLICIES)[number];

const POLICY_TITLES: Record<PolicySlug, string> = {
  "terms-of-service": "Terms of Service",
  "privacy-policy": "Privacy Policy",
  "shipping-policy": "Shipping Policy",
  "refund-policy": "Refund Policy",
};

interface Props {
  params: Promise<{ policy: string }>;
}

export async function generateStaticParams() {
  return VALID_POLICIES.map((policy) => ({ policy }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { policy } = await params;
  if (!VALID_POLICIES.includes(policy as PolicySlug)) {
    return { title: "Not Found" };
  }
  const page = await getPageServer(policy).catch(() => null);
  if (page) return generatePageMetadata(page);
  return {
    title: POLICY_TITLES[policy as PolicySlug] ?? policy,
  };
}

export default async function PolicyPage({ params }: Props) {
  const { policy } = await params;
  if (!VALID_POLICIES.includes(policy as PolicySlug)) notFound();

  const page = await getPageServer(policy).catch(() => null);
  const title = page?.title ?? POLICY_TITLES[policy as PolicySlug] ?? policy;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">{title}</h1>
      {page?.body ? (
        <RichTextRenderer html={page.body} />
      ) : (
        <p className="text-gray-500">
          This page is not yet available. Please check back later.
        </p>
      )}
    </div>
  );
}
