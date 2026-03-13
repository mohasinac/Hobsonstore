"use client";

import { useEffect, useState } from "react";
import { getLoyaltyConfig, updateLoyaltyConfig } from "@/lib/firebase/config";
import { LoyaltyConfigForm } from "@/components/admin/LoyaltyConfigForm";
import type { LoyaltyConfig } from "@/types/config";

const DEFAULT_CONFIG: LoyaltyConfig = {
  coinsPerRupee: 1,
  rupeePerCoin: 0.25,
  minCoinsToRedeem: 100,
  maxRedeemPercent: 20,
  active: true,
};

export default function AdminLoyaltyPage() {
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLoyaltyConfig()
      .then((c) => {
        setConfig(c ?? DEFAULT_CONFIG);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(data: LoyaltyConfig) {
    await updateLoyaltyConfig(data);
    setConfig(data);
  }

  if (loading) return <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>;

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Loyalty Config</h1>
      <LoyaltyConfigForm initial={config!} onSubmit={handleSubmit} />
    </div>
  );
}
