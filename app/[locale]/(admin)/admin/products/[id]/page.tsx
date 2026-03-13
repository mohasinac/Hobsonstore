"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductById, updateProduct } from "@/lib/firebase/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { InventoryEditForm } from "@/components/admin/InventoryEditForm";
import type { Product } from "@/types/product";
import type { ProductWritePayload } from "@/lib/firebase/products";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [tab, setTab] = useState<"details" | "inventory">("details");
  const [loading, setLoading] = useState(true);
  const [pId, setPId] = useState<string>("");

  useEffect(() => {
    params
      .then(({ id }) => {
        setPId(id);
        return getProductById(id).then((p) => {
          setProduct(p);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
  }, [params]);

  async function handleSubmit(data: ProductWritePayload) {
    const reserved = product!.reservedStock ?? 0;
    const newStock = data.stock ?? 0;
    await updateProduct(pId, {
      ...data,
      availableStock: Math.max(0, newStock - reserved),
      inStock: newStock - reserved > 0,
    });
    router.push("/admin/products");
  }

  if (loading) return <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>;
  if (!product) return <p className="text-sm text-red-600">Product not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Edit: {product.name}</h1>

      <div className="flex gap-4" style={{ borderBottom: '2px solid var(--border-ink)' }}>
        {(["details", "inventory"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium capitalize ${tab === t ? "border-b-2 border-red-600 text-red-600" : "dark:text-slate-400 text-gray-500"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "details" && <ProductForm initial={product} onSubmit={handleSubmit} submitLabel="Save Changes" />}
      {tab === "inventory" && <InventoryEditForm product={product} />}
    </div>
  );
}
