"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { formatINR } from "@/lib/formatCurrency";

interface CoinRedeemToggleProps {
  availableCoins: number;
  /** Amount in ₹ that will be deducted if redeemed */
  savingsAmount: number;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  /** If false the loyalty system is inactive — hides the component */
  loyaltyActive?: boolean;
}

export function CoinRedeemToggle({
  availableCoins,
  savingsAmount,
  enabled,
  onToggle,
  loyaltyActive = true,
}: CoinRedeemToggleProps) {
  if (!loyaltyActive || availableCoins <= 0) return null;

  return (
    <div
      className="px-4 py-3"
      style={{
        border: "2px solid var(--border-ink)",
        background: "var(--surface-warm)",
        boxShadow: "3px 3px 0px var(--border-ink)",
      }}
    >
      <Checkbox
        label={`Use ${availableCoins} HC Coins (save ${formatINR(savingsAmount)})`}
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
      />
    </div>
  );
}
