"use client";

import { useEffect, useState } from "react";
import { getPage, upsertPage } from "@/lib/firebase/content";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ContentPage } from "@/types/content";

const KNOWN_SLUGS = ["about", "privacy-policy", "terms-of-service", "return-policy", "shipping-policy"];

export default function EditPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const [page, setPage] = useState<Partial<ContentPage>>({ body: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    params.then(({ slug: s }) => {
      setSlug(s);
      getPage(s).then((p) => {
        if (p) setPage(p);
        setLoading(false);
      });
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await upsertPage(slug, page as Omit<ContentPage, "slug">);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Edit Page: <code className="text-base font-mono">{slug}</code></h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Saved.</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Page Title" value={page.title ?? ""} onChange={(e) => setPage((p) => ({ ...p, title: e.target.value }))} />
        <Input label="SEO Title" value={page.seoTitle ?? ""} onChange={(e) => setPage((p) => ({ ...p, seoTitle: e.target.value }))} />
        <Input label="SEO Description" value={page.seoDescription ?? ""} onChange={(e) => setPage((p) => ({ ...p, seoDescription: e.target.value }))} />
        <ContentEditor label="Body" value={page.body ?? ""} onChange={(html) => setPage((p) => ({ ...p, body: html }))} />
        <Button type="submit" loading={saving}>Save Page</Button>
      </form>

      <div className="rounded-md border p-4">
        <h2 className="font-medium text-sm mb-2" style={{ color: 'var(--color-black)' }}>Other Pages</h2>
        <ul className="space-y-1">
          {KNOWN_SLUGS.filter((s) => s !== slug).map((s) => (
            <li key={s}>
              <a href={`/admin/pages/${s}`} className="text-sm text-red-600 hover:underline">{s}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
