"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBrandsAdmin, deleteBrand, updateBrandOrder } from "@/lib/firebase/brands";
import { revalidateContentCache } from "@/lib/actions/revalidate";
import { DraggableList } from "@/components/admin/DraggableList";
import { Button } from "@/components/ui/Button";
import type { Brand } from "@/types/brand";

type BrandItem = Brand & { id: string };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBrandsAdmin()
      .then((items) => {
        setBrands(
          items
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((b) => ({ ...b, id: b.slug }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleReorder(reordered: BrandItem[]) {
    setBrands(reordered);
    Promise.all(reordered.map((b, i) => updateBrandOrder(b.slug, i))).catch(console.error);
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete brand "${slug}"?`)) return;
    await deleteBrand(slug);
    void revalidateContentCache();
    setBrands((prev) => prev.filter((b) => b.slug !== slug));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Brands</h1>
        <Link href="/admin/brands/new">
          <Button size="sm">+ New Brand</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>
      ) : brands.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No brands yet.</p>
      ) : (
        <DraggableList<BrandItem>
          items={brands}
          onReorder={handleReorder}
          renderItem={(b) => (
            <div className="flex items-center justify-between rounded-md border px-4 py-3" style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-ink)' }}>
              <div>
                <p className="font-medium text-sm">{b.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{b.slug} · {b.active ? "active" : "inactive"}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/brands/${b.slug}`} className="text-xs text-red-600 hover:underline">Edit</Link>
                <button onClick={() => handleDelete(b.slug)} className="text-xs dark:text-slate-500 text-gray-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
