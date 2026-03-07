"use client";

import { useRouter } from "next/navigation";
import { upsertDiscount } from "@/lib/firebase/discounts";
import { DiscountForm } from "@/components/admin/DiscountForm";
import type { Discount } from "@/types/config";

export default function NewDiscountPage() {
  const router = useRouter();

  async function handleSubmit(code: string, data: Omit<Discount, "code" | "usedCount">) {
    await upsertDiscount(code, { ...data, usedCount: 0 });
    router.push("/admin/discounts");
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-bold text-gray-900">New Discount</h1>
      <DiscountForm onSubmit={handleSubmit} submitLabel="Create Discount" />
    </div>
  );
}
