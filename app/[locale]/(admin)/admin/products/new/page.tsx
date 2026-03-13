"use client";

import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/firebase/products";
import { revalidateProductsCache } from "@/lib/actions/revalidate";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductWritePayload } from "@/lib/firebase/products";

export default function NewProductPage() {
  const router = useRouter();

  async function handleSubmit(data: ProductWritePayload) {
    await createProduct(data);
    void revalidateProductsCache();
    router.push("/admin/products");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>New Product</h1>
      <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" />
    </div>
  );
}
