"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllProductsAdmin, deleteProduct } from "@/lib/firebase/products";
import { revalidateProductsCache } from "@/lib/actions/revalidate";
import { ProductTableRow } from "@/components/admin/ProductTableRow";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/product";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProductsAdmin(200)
      .then(({ products: prods }) => {
        setProducts(prods);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    const product = products.find((p) => p.id === id);
    if (!confirm(`Delete "${product?.name ?? id}"? This cannot be undone.`)) return;
    await deleteProduct(id);
    void revalidateProductsCache();
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Products</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/bulk-upload">
            <Button variant="secondary" size="sm">Bulk Upload</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button size="sm">+ New Product</Button>
          </Link>
        </div>
      </div>

      <input
        type="search"
        placeholder="Search by name or slug…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 text-sm outline-none"
        style={{ border: '2px solid var(--border-ink)', background: 'var(--surface-elevated)', color: 'var(--color-black)' }}
      />

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase" style={{ background: 'var(--surface-warm)', color: 'var(--color-muted)' }}>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-right">Sale Price</th>
                <th className="px-4 py-2 text-right">Stock</th>
                <th className="px-4 py-2 text-right">Available</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <ProductTableRow key={p.id} product={p} onDelete={handleDelete} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center" style={{ color: 'var(--color-muted)' }}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
