"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { Discount } from "@/types/config";

interface DiscountFormProps {
  initial?: Partial<Discount>;
  onSubmit: (code: string, data: Omit<Discount, "code" | "usedCount">) => Promise<void>;
  submitLabel?: string;
  codeEditable?: boolean;
}

export function DiscountForm({ initial, onSubmit, submitLabel = "Save", codeEditable = true }: DiscountFormProps) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [type, setType] = useState<"percent" | "flat">(initial?.type ?? "percent");
  const [value, setValue] = useState(String(initial?.value ?? ""));
  const [minOrderValue, setMinOrderValue] = useState(String(initial?.minOrderValue ?? ""));
  const [maxUses, setMaxUses] = useState(String(initial?.maxUses ?? ""));
  const [applicableCollections, setApplicableCollections] = useState((initial?.applicableCollections ?? []).join(", "));
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(initial?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code) { setError("Code is required"); return; }
    setLoading(true);
    try {
      const data: Omit<Discount, "code" | "usedCount"> = {
        type,
        value: parseFloat(value) || 0,
        active,
        ...(minOrderValue ? { minOrderValue: parseFloat(minOrderValue) } : {}),
        ...(maxUses ? { maxUses: parseInt(maxUses) } : {}),
        ...(applicableCollections ? { applicableCollections: applicableCollections.split(",").map((s) => s.trim()).filter(Boolean) } : {}),
        ...(expiresAt ? { expiresAt: { toDate: () => new Date(expiresAt) } as unknown as Discount["expiresAt"] } : {}),
      };
      await onSubmit(code.toUpperCase(), data);
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
        label="Discount Code *"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        disabled={!codeEditable}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-black)' }}>Type</label>
          <select className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: 'var(--border-ink)', background: 'var(--surface-elevated)', color: 'var(--color-black)' }} value={type} onChange={(e) => setType(e.target.value as "percent" | "flat")}>
            <option value="percent">Percent (%)</option>
            <option value="flat">Flat (₹)</option>
          </select>
        </div>
        <Input label={type === "percent" ? "Value (%)" : "Value (₹)"} type="number" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Min Order Value (₹)" type="number" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} />
        <Input label="Max Uses (leave blank = unlimited)" type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
      </div>
      <Input label="Applicable Collections (slugs, comma-sep; blank = all)" value={applicableCollections} onChange={(e) => setApplicableCollections(e.target.value)} />
      <Input label="Expires At" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      <Checkbox label="Active" checked={active} onChange={(e) => setActive(e.target.checked)} />
      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
