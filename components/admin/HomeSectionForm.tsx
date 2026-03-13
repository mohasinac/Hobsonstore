"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { HomeSection } from "@/types/content";

interface HomeSectionFormProps {
  initial?: Partial<HomeSection>;
  onSubmit: (data: Omit<HomeSection, "id">) => Promise<void>;
  submitLabel?: string;
}

export function HomeSectionForm({ initial, onSubmit, submitLabel = "Save" }: HomeSectionFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [type, setType] = useState<HomeSection["type"]>(initial?.type ?? "featured");
  const [collectionSlug, setCollectionSlug] = useState(initial?.collectionSlug ?? "");
  const [manualProductIds, setManualProductIds] = useState((initial?.manualProductIds ?? []).join(", "));
  const [itemLimit, setItemLimit] = useState(String(initial?.itemLimit ?? 8));
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [active, setActive] = useState(initial?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        title,
        subtitle: subtitle || undefined,
        type,
        collectionSlug: collectionSlug || undefined,
        manualProductIds: manualProductIds ? manualProductIds.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        itemLimit: parseInt(itemLimit) || 8,
        sortOrder: parseInt(sortOrder) || 0,
        active,
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
      <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input label="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-black)' }}>Section Type</label>
        <select className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--border-ink)', background: 'var(--surface-elevated)', color: 'var(--color-black)' }} value={type} onChange={(e) => setType(e.target.value as HomeSection["type"])}>
          <option value="featured">Featured</option>
          <option value="bestseller">Bestseller</option>
          <option value="new-arrivals">New Arrivals</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <Input label="Collection Slug (pull products from)" value={collectionSlug} onChange={(e) => setCollectionSlug(e.target.value)} />
      <Input label="Manual Product IDs (comma-separated)" value={manualProductIds} onChange={(e) => setManualProductIds(e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Item Limit" type="number" value={itemLimit} onChange={(e) => setItemLimit(e.target.value)} />
        <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      </div>
      <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
