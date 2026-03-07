"use client";

import Link from "next/link";

const contentSections = [
  { href: "/admin/content/banners", label: "Banners", description: "Hero banners for the homepage" },
  { href: "/admin/content/home-sections", label: "Home Sections", description: "Featured / bestseller product sections" },
  { href: "/admin/content/testimonials", label: "Testimonials", description: "Customer reviews carousel" },
  { href: "/admin/content/faq", label: "FAQ", description: "Frequently asked questions" },
  { href: "/admin/content/announcements", label: "Announcements", description: "Top-of-page announcement bar" },
];

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Content</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {contentSections.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-md border bg-white p-4 hover:border-red-300 transition-colors">
            <p className="font-semibold text-gray-800">{s.label}</p>
            <p className="text-sm text-gray-500 mt-1">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
