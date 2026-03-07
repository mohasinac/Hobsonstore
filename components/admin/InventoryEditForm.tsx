"use client";

import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/client";
import { updateProduct } from "@/lib/firebase/products";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CameraCapture } from "./CameraCapture";
import type { Product } from "@/types/product";

interface InventoryEditFormProps {
  product: Product;
  onSaved?: () => void;
}

export function InventoryEditForm({ product, onSaved }: InventoryEditFormProps) {
  const [stock, setStock] = useState(String(product.stock));
  const [threshold, setThreshold] = useState(String(product.lowStockThreshold));
  const [restockNote, setRestockNote] = useState("");
  const [conditionPhotos, setConditionPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const storage = getStorage(getFirebaseApp());
      const urls = await Promise.all(
        files.map(async (file) => {
          const r = ref(storage, `products/${product.slug}/restock/${Date.now()}_${file.name}`);
          await uploadBytes(r, file);
          return getDownloadURL(r);
        }),
      );
      setConditionPhotos((prev) => [...prev, ...urls]);
    } finally {
      setUploading(false);
    }
  }

  async function handleCameraCapture(url: string) {
    setConditionPhotos((prev) => [...prev, url]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const newStock = parseInt(stock) || 0;
      const newThreshold = parseInt(threshold) || 5;
      await updateProduct(product.id, {
        stock: newStock,
        availableStock: Math.max(0, newStock - product.reservedStock),
        inStock: newStock > 0,
        lowStockThreshold: newThreshold,
      });
      setSuccess(true);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">✓ Inventory updated</p>}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="New Stock Qty"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <Input
          label="Low Stock Threshold"
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Restock Note</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          rows={2}
          placeholder="Optional note about this restock"
          value={restockNote}
          onChange={(e) => setRestockNote(e.target.value)}
          maxLength={500}
        />
      </div>

      {/* Condition photos */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Condition Photos (optional)</p>
        <div className="flex flex-wrap gap-2">
          {conditionPhotos.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="h-16 w-16 rounded object-cover border" />
          ))}
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
            Upload Photo
            <input type="file" accept="image/*" multiple className="sr-only" onChange={handlePhotoUpload} />
          </label>
          <CameraCapture
            productSlug={product.slug}
            onCapture={(url) => handleCameraCapture(url)}
            mode="image"
          />
        </div>
        {uploading && <p className="text-xs text-amber-600">Uploading…</p>}
      </div>

      <Button type="submit" loading={saving}>Update Inventory</Button>
    </form>
  );
}
