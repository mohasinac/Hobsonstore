"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import type { SiteConfig, SiteLocation } from "@/types/config";

interface SiteConfigFormProps {
  initial: SiteConfig;
  onSubmit: (data: SiteConfig) => Promise<void>;
}

const defaultLocation: SiteLocation = {
  city: "",
  address: "",
  phone: "",
  mapUrl: "",
  active: true,
};

export function SiteConfigForm({ initial, onSubmit }: SiteConfigFormProps) {
  const [form, setForm] = useState<SiteConfig>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setLocation(idx: number, key: keyof SiteLocation, value: string | boolean) {
    const updated = form.locations.map((loc, i) =>
      i === idx ? { ...loc, [key]: value } : loc
    );
    set("locations", updated);
  }

  function addLocation() {
    set("locations", [...form.locations, { ...defaultLocation }]);
  }

  function removeLocation(idx: number) {
    set("locations", form.locations.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(form);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Saved successfully.</p>}

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Branding</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Site Name" value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
          <Input label="Site Tagline" value={form.siteTagline} onChange={(e) => set("siteTagline", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Logo URL" value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} />
          <Input label="Favicon URL" value={form.faviconUrl} onChange={(e) => set("faviconUrl", e.target.value)} />
        </div>
        <Input label="Default OG Image URL" value={form.defaultOgImage} onChange={(e) => set("defaultOgImage", e.target.value)} />
        <Input label="Footer Copyright" value={form.footerCopyright} onChange={(e) => set("footerCopyright", e.target.value)} />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Contact Email" type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
          <Input label="Phone (Customer Care)" value={form.phoneCustomerCare} onChange={(e) => set("phoneCustomerCare", e.target.value)} />
        </div>
        <Input label="Support Hours" value={form.supportHours} onChange={(e) => set("supportHours", e.target.value)} />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">WhatsApp</h3>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Customer Care" value={form.whatsappCustomerCare} onChange={(e) => set("whatsappCustomerCare", e.target.value)} />
          <Input label="Admin Bot" value={form.whatsappAdminBot} onChange={(e) => set("whatsappAdminBot", e.target.value)} />
          <Input label="Status Updates" value={form.whatsappStatues} onChange={(e) => set("whatsappStatues", e.target.value)} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Social</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Facebook URL" value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} />
          <Input label="Instagram URL" value={form.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Commerce</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Free Shipping Minimum (₹)" type="number" value={String(form.freeShippingMinimum)} onChange={(e) => set("freeShippingMinimum", parseFloat(e.target.value) || 0)} />
          <Input label="Low Stock Default Threshold" type="number" value={String(form.inventoryLowStockDefault)} onChange={(e) => set("inventoryLowStockDefault", parseInt(e.target.value) || 0)} />
        </div>
        <Checkbox label="No-index admin routes" checked={form.noIndexAdmin} onChange={(e) => set("noIndexAdmin", e.target.checked)} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Locations</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addLocation}>+ Add Location</Button>
        </div>
        {form.locations.map((loc, idx) => (
          <div key={idx} className="border rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Location {idx + 1}</span>
              <button type="button" onClick={() => removeLocation(idx)} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={loc.city} onChange={(e) => setLocation(idx, "city", e.target.value)} />
              <Input label="Phone" value={loc.phone} onChange={(e) => setLocation(idx, "phone", e.target.value)} />
            </div>
            <Input label="Address" value={loc.address} onChange={(e) => setLocation(idx, "address", e.target.value)} />
            <Input label="Map URL" value={loc.mapUrl} onChange={(e) => setLocation(idx, "mapUrl", e.target.value)} />
            <Checkbox label="Active" checked={loc.active} onChange={(e) => setLocation(idx, "active", e.target.checked)} />
          </div>
        ))}
      </section>

      <Button type="submit" loading={loading}>Save Site Config</Button>
    </form>
  );
}
