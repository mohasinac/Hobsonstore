"use client";

import { useEffect, useState } from "react";
import { getSiteConfig, updateSiteConfig, getOrderStatusConfig, updateOrderStatusConfigEntry } from "@/lib/firebase/config";
import { revalidateContentCache } from "@/lib/actions/revalidate";
import { SiteConfigForm } from "@/components/admin/SiteConfigForm";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import type { SiteConfig, OrderStatusConfig } from "@/types/config";

const DEFAULT_SITE: SiteConfig = {
  siteName: "", siteTagline: "", logoUrl: "", faviconUrl: "", defaultOgImage: "",
  contactEmail: "", whatsappCustomerCare: "", whatsappStatuses: "", whatsappAdminBot: "",
  phoneCustomerCare: "", facebookUrl: "", instagramUrl: "", supportHours: "",
  freeShippingMinimum: 0, inventoryLowStockDefault: 5, noIndexAdmin: true,
  footerCopyright: "", locations: [],
};

export default function AdminConfigPage() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [statusConfigs, setStatusConfigs] = useState<OrderStatusConfig[]>([]);
  const [tab, setTab] = useState<"site" | "order-status">("site");
  const [loading, setLoading] = useState(true);
  const [statusSaved, setStatusSaved] = useState(false);

  useEffect(() => {
    Promise.all([getSiteConfig(), getOrderStatusConfig()]).then(([sc, osc]) => {
      setSiteConfig(sc ?? DEFAULT_SITE);
      setStatusConfigs(osc.sort((a, b) => a.sortOrder - b.sortOrder));
      setLoading(false);
    });
  }, []);

  async function handleSiteConfig(data: SiteConfig) {
    await updateSiteConfig(data);
    void revalidateContentCache();
    setSiteConfig(data);
  }

  function updateStatusEntry(idx: number, key: keyof OrderStatusConfig, value: string | boolean | number) {
    setStatusConfigs((prev) => prev.map((c, i) => i === idx ? { ...c, [key]: value } : c));
    setStatusSaved(false);
  }

  async function saveStatusEntries() {
    await Promise.all(statusConfigs.map((c) => updateOrderStatusConfigEntry(c.status, c)));
    setStatusSaved(true);
  }

  if (loading) return <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Config</h1>

      <div className="flex gap-4" style={{ borderBottom: '2px solid var(--border-ink)' }}>
        {(["site", "order-status"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`pb-2 text-sm font-medium ${tab === t ? "border-b-2 border-red-600 text-red-600" : "dark:text-slate-400 text-gray-500"}`}>
            {t === "site" ? "Site Config" : "Order Statuses"}
          </button>
        ))}
      </div>

      {tab === "site" && siteConfig && (
        <SiteConfigForm initial={siteConfig} onSubmit={handleSiteConfig} />
      )}

      {tab === "order-status" && (
        <div className="space-y-4">
          {statusSaved && <p className="text-sm text-green-600">Saved.</p>}
          {statusConfigs.map((cfg, idx) => (
            <div key={cfg.status} className="rounded-md border p-4 space-y-3">
              <p className="font-medium text-sm capitalize">{cfg.status}</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Label" value={cfg.label} onChange={(e) => updateStatusEntry(idx, "label", e.target.value)} />
                <Input label="Color (Tailwind class)" value={cfg.color} onChange={(e) => updateStatusEntry(idx, "color", e.target.value)} />
              </div>
              <Input label="WhatsApp Template" value={cfg.waTemplate} onChange={(e) => updateStatusEntry(idx, "waTemplate", e.target.value)} />
              <Checkbox label="Notify Customer" checked={cfg.notifyCustomer} onChange={(e) => updateStatusEntry(idx, "notifyCustomer", e.target.checked)} />
            </div>
          ))}
          <Button onClick={saveStatusEntries}>Save Order Status Config</Button>
        </div>
      )}
    </div>
  );
}
