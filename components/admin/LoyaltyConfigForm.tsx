"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { LoyaltyConfig } from "@/types/config";

interface LoyaltyConfigFormProps {
  initial?: Partial<LoyaltyConfig>;
  onSubmit: (data: LoyaltyConfig) => Promise<void>;
}

export function LoyaltyConfigForm({ initial, onSubmit }: LoyaltyConfigFormProps) {
  const [coinsPerRupee, setCoinsPerRupee] = useState(String(initial?.coinsPerRupee ?? 1));
  const [rupeePerCoin, setRupeePerCoin] = useState(String(initial?.rupeePerCoin ?? 1));
  const [minCoinsToRedeem, setMinCoinsToRedeem] = useState(String(initial?.minCoinsToRedeem ?? 100));
  const [maxRedeemPercent, setMaxRedeemPercent] = useState(String(initial?.maxRedeemPercent ?? 10));
  const [active, setActive] = useState(initial?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await onSubmit({
        coinsPerRupee: parseFloat(coinsPerRupee) || 1,
        rupeePerCoin: parseFloat(rupeePerCoin) || 1,
        minCoinsToRedeem: parseInt(minCoinsToRedeem) || 100,
        maxRedeemPercent: parseInt(maxRedeemPercent) || 10,
        active,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">✓ Saved</p>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label="Coins earned per ₹ spent"
            type="number"
            value={coinsPerRupee}
            onChange={(e) => setCoinsPerRupee(e.target.value)}
          />
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>e.g. 0.01 = 1 coin per ₹100</p>
        </div>
        <div>
          <Input
            label="Redemption rate (₹ per coin)"
            type="number"
            value={rupeePerCoin}
            onChange={(e) => setRupeePerCoin(e.target.value)}
          />
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>e.g. 1 = 1 coin saves ₹1</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Minimum coins to redeem" type="number" value={minCoinsToRedeem} onChange={(e) => setMinCoinsToRedeem(e.target.value)} />
        <div>
          <Input label="Max redeem % of order total" type="number" value={maxRedeemPercent} onChange={(e) => setMaxRedeemPercent(e.target.value)} />
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>e.g. 10 = max 10% of order payable in coins</p>
        </div>
      </div>
      <Checkbox label="Loyalty programme active" checked={active} onChange={(e) => setActive(e.target.checked)} />
      <Button type="submit" loading={loading}>Save Loyalty Config</Button>
    </form>
  );
}
