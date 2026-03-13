"use client";

import { useRouter } from "next/navigation";
import { upsertBrand } from "@/lib/firebase/brands";
import { BrandForm } from "@/components/admin/BrandForm";
import type { Brand } from "@/types/brand";

export default function NewBrandPage() {
  const router = useRouter();

  async function handleSubmit(data: Brand) {
    await upsertBrand(data.slug, data);
    router.push("/admin/brands");
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>New Brand</h1>
      <BrandForm onSubmit={handleSubmit} submitLabel="Create Brand" />
    </div>
  );
}
