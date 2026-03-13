"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrand, upsertBrand } from "@/lib/firebase/brands";
import { revalidateContentCache } from "@/lib/actions/revalidate";
import { BrandForm } from "@/components/admin/BrandForm";
import type { Brand } from "@/types/brand";

export default function EditBrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ slug }) => {
      getBrand(slug).then((b) => {
        setBrand(b);
        setLoading(false);
      });
    });
  }, [params]);

  async function handleSubmit(data: Brand) {
    await upsertBrand(data.slug, data);
    void revalidateContentCache();
    router.push("/admin/brands");
  }

  if (loading) return <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>;
  if (!brand) return <p className="text-sm text-red-600">Brand not found.</p>;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Edit: {brand.name}</h1>
      <BrandForm initial={brand} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}
