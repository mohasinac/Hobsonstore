"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { PromoBanner } from "@/types/content";

interface PromoBannerFormProps {
  initial?: Partial<PromoBanner>;
  onSubmit: (data: Omit<PromoBanner, "id">) => Promise<void>;
  submitLabel?: string;
}

export function PromoBannerForm({ initial, onSubmit, submitLabel = "Save" }: PromoBannerFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel ?? "");
  const [ctaUrl, setCtaUrl] = useState(initial?.ctaUrl ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [active, setActive] = useState(initial?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ title, ctaLabel, ctaUrl, image, sortOrder: parseInt(sortOrder) || 0, active });
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
      <Input label="Image URL *" value={image} onChange={(e) => setImage(e.target.value)} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="CTA Label *" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} required />
        <Input label="CTA URL *" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} required />
      </div>
      <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
