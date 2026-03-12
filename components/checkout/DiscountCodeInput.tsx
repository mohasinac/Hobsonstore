"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/formatCurrency";

interface DiscountCodeInputProps {
  appliedCode: string | null;
  discountAmount: number;
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
  loading?: boolean;
}

export function DiscountCodeInput({
  appliedCode,
  discountAmount,
  onApply,
  onRemove,
  loading = false,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState("");

  if (appliedCode) {
    return (
      <div
        className="flex items-center justify-between px-4 py-2 text-sm"
        style={{
          border: "2px solid var(--border-ink)",
          background: "var(--surface-warm)",
          boxShadow: "3px 3px 0px var(--border-ink)",
        }}
      >
        <span style={{ color: "var(--color-black)" }}>
          Code <strong style={{ color: "var(--color-red)" }}>{appliedCode}</strong> applied — you save{" "}
          <strong>{formatINR(discountAmount)}</strong>
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="ml-3 text-xs font-bold underline"
          style={{ color: "var(--color-muted)" }}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          label=""
          placeholder="Discount code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
      </div>
      <Button
        variant="secondary"
        onClick={() => onApply(code)}
        loading={loading}
        disabled={!code.trim()}
        className="self-end"
      >
        Apply
      </Button>
    </div>
  );
}
