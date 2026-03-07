"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { FAQItem } from "@/types/content";

interface FAQFormProps {
  initial?: Partial<FAQItem>;
  onSubmit: (data: Omit<FAQItem, "id">) => Promise<void>;
  submitLabel?: string;
}

export function FAQForm({ initial, onSubmit, submitLabel = "Save" }: FAQFormProps) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [active, setActive] = useState(initial?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ question, answer, sortOrder: parseInt(sortOrder) || 0, active });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
        <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Answer * (HTML allowed)</label>
        <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} required />
      </div>
      <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
