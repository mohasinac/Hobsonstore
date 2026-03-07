"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { Testimonial } from "@/types/content";

interface TestimonialFormProps {
  initial?: Partial<Testimonial>;
  onSubmit: (data: Omit<Testimonial, "id">) => Promise<void>;
  submitLabel?: string;
}

export function TestimonialForm({ initial, onSubmit, submitLabel = "Save" }: TestimonialFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(initial?.rating ?? 5);
  const [text, setText] = useState(initial?.text ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatarUrl ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [active, setActive] = useState(initial?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ name, rating, text, avatarUrl: avatarUrl || undefined, featured, sortOrder: parseInt(sortOrder) || 0, active });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Input label="Customer Name *" value={name} onChange={(e) => setName(e.target.value)} required />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={rating} onChange={(e) => setRating(parseInt(e.target.value) as 1|2|3|4|5)}>
          {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} star{n>1?"s":""}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial Text *</label>
        <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={4} value={text} onChange={(e) => setText(e.target.value)} required />
      </div>
      <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
      <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <div className="flex gap-4">
        <Checkbox label="Featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
      </div>
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
