"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { Brand } from "@/types/brand";

type BrandFormData = Brand;

interface BrandFormProps {
  initial?: Partial<BrandFormData>;
  onSubmit: (data: BrandFormData) => Promise<void>;
  submitLabel?: string;
}

export function BrandForm({ initial, onSubmit, submitLabel = "Save" }: BrandFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [logoImage, setLogoImage] = useState(initial?.logoImage ?? "");
  const [bannerImage, setBannerImage] = useState(initial?.bannerImage ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [active, setActive] = useState(initial?.active ?? true);
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function autoSlug(n: string) {
    return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !slug) { setError("Name and slug are required"); return; }
    setLoading(true);
    try {
      await onSubmit({
        name,
        slug,
        logoImage: logoImage || undefined,
        bannerImage: bannerImage || undefined,
        description: description || undefined,
        sortOrder: parseInt(sortOrder) || 0,
        active,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Input
        label="Name *"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!initial?.slug) setSlug(autoSlug(e.target.value));
        }}
        required
      />
      <Input
        label="Slug *"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="e.g. hot-toys"
        required
      />
      <Input
        label="Logo Image URL"
        value={logoImage}
        onChange={(e) => setLogoImage(e.target.value)}
        placeholder="Transparent PNG — /brand index and homepage strip"
      />
      <Input
        label="Banner Image URL"
        value={bannerImage}
        onChange={(e) => setBannerImage(e.target.value)}
        placeholder="Full-width header on /brand/[slug]"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Input
        label="Sort Order"
        type="number"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      />
      <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
      <Input label="SEO Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
      <Input label="SEO Description" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
