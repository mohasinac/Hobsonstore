"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { TrustBadge, TrustBadgeIconKey } from "@/types/content";

const ICON_OPTIONS: { value: TrustBadgeIconKey; label: string }[] = [
  { value: "shipping", label: "Shipping / Delivery" },
  { value: "support", label: "Support / Chat" },
  { value: "rewards", label: "Loyalty / Rewards" },
  { value: "secure", label: "Secure Payments" },
];

interface TrustBadgeFormProps {
  initial?: Partial<TrustBadge>;
  onSubmit: (data: Omit<TrustBadge, "id">) => Promise<void>;
  submitLabel?: string;
}

export function TrustBadgeForm({ initial, onSubmit, submitLabel = "Save" }: TrustBadgeFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [sub, setSub] = useState(initial?.sub ?? "");
  const [iconKey, setIconKey] = useState<TrustBadgeIconKey>(initial?.iconKey ?? "shipping");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [active, setActive] = useState(initial?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ title, sub, iconKey, sortOrder: parseInt(sortOrder) || 0, active });
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
      <Input label="Subtitle *" value={sub} onChange={(e) => setSub(e.target.value)} required />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icon *</label>
        <select
          value={iconKey}
          onChange={(e) => setIconKey(e.target.value as TrustBadgeIconKey)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {ICON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
