"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { Announcement } from "@/types/content";

interface AnnouncementFormProps {
  initial?: Partial<Announcement>;
  onSubmit: (data: Omit<Announcement, "id">) => Promise<void>;
  submitLabel?: string;
}

export function AnnouncementForm({ initial, onSubmit, submitLabel = "Save" }: AnnouncementFormProps) {
  const [message, setMessage] = useState(initial?.message ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [linkLabel, setLinkLabel] = useState(initial?.linkLabel ?? "");
  const [bgColor, setBgColor] = useState(initial?.bgColor ?? "");
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
      await onSubmit({ message, link: link || undefined, linkLabel: linkLabel || undefined, bgColor: bgColor || undefined, textColor: textColor || undefined, sortOrder: parseInt(sortOrder) || 0, active });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Input label="Message *" value={message} onChange={(e) => setMessage(e.target.value)} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Link URL" value={link} onChange={(e) => setLink(e.target.value)} />
        <Input label="Link Label" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Background Color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        <Input label="Text Color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
      </div>
      <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
