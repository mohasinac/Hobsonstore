"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateProduct } from "@/lib/firebase/products";
import { formatINR } from "@/lib/formatCurrency";
import type { Product } from "@/types/product";

interface ProductTableRowProps {
  product: Product;
  onDelete?: (id: string) => void;
}

export function ProductTableRow({ product, onDelete }: ProductTableRowProps) {
  const [editingStock, setEditingStock] = useState(false);
  const [stock, setStock] = useState(String(product.stock));
  const [saving, setSaving] = useState(false);

  async function saveStock() {
    const n = parseInt(stock);
    if (isNaN(n) || n < 0) return;
    setSaving(true);
    try {
      await updateProduct(product.id, { stock: n, availableStock: Math.max(0, n - product.reservedStock), inStock: n > 0 });
      setEditingStock(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b dark:hover:bg-white/5 hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {product.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt="" className="h-10 w-10 rounded object-cover flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--color-black)' }}>{product.name}</p>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{product.slug}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm">{formatINR(product.salePrice)}</td>
      <td className="py-3 px-4 text-sm">
        {editingStock ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              className="w-16 rounded border px-2 py-0.5 text-sm"
              style={{ borderColor: 'var(--border-ink)', background: 'var(--surface-elevated)', color: 'var(--color-black)' }}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              autoFocus
            />
            <Button variant="primary" className="py-0.5 px-2 text-xs" loading={saving} onClick={saveStock}>Save</Button>
            <button type="button" onClick={() => setEditingStock(false)} className="text-xs dark:text-slate-400 dark:hover:text-slate-200 text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingStock(true)}
            className="flex items-center gap-1 text-left hover:text-red-600"
          >
            {product.availableStock}
            <span className="dark:text-slate-500 text-gray-400 text-xs">✏</span>
          </button>
        )}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          product.inStock
            ? "bg-green-100 text-green-700"
            : product.isPreorder
            ? "bg-amber-100 text-amber-700"
            : "bg-red-100 text-red-700"
        }`}>
          {product.isPreorder ? "Pre-order" : product.inStock ? "In Stock" : "Sold Out"}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${product.id}`} className="text-xs text-blue-600 hover:underline">Edit</Link>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(product.id)}
              className="text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
