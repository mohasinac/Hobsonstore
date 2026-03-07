"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { Banner } from "@/types/content";

interface BannerFormProps {
  initial?: Partial<Banner>;
  onSubmit: (data: Omit<Banner, "id">) => Promise<void>;
  submitLabel?: string;
}

export function BannerForm({ initial, onSubmit, submitLabel = "Save" }: BannerFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel ?? "");
  const [ctaUrl, setCtaUrl] = useState(initial?.ctaUrl ?? "");
  const [backgroundImage, setBackgroundImage] = useState(initial?.backgroundImage ?? "");
  const [backgroundColor, setBackgroundColor] = useState(initial?.backgroundColor ?? "");
  const [textColor, setTextColor] = useState(initial?.textColor ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [active, setActive] = useState(initial?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ title, subtitle: subtitle || undefined, ctaLabel: ctaLabel || undefined, ctaUrl: ctaUrl || undefined, backgroundImage: backgroundImage || undefined, backgroundColor: backgroundColor || undefined, textColor: textColor || undefined, sortOrder: parseInt(sortOrder) || 0, active });
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
      <div className="grid grid-cols-2 gap-4">
        <Input label="CTA Label" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
        <Input label="CTA URL" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
      </div>
      <Input label="Background Image URL" value={backgroundImage} onChange={(e) => setBackgroundImage(e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Background Color (Tailwind or hex)" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
        <Input label="Text Color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
      </div>
      <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
