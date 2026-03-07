"use client";

import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { CameraCapture } from "./CameraCapture";
import type { Product } from "@/types/product";
import type { ProductWritePayload } from "@/lib/firebase/products";

interface ProductFormProps {
  initial?: Partial<Product>;
  onSubmit: (data: ProductWritePayload) => Promise<void>;
  submitLabel?: string;
}

export function ProductForm({ initial, onSubmit, submitLabel = "Save" }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [salePrice, setSalePrice] = useState(String(initial?.salePrice ?? ""));
  const [regularPrice, setRegularPrice] = useState(String(initial?.regularPrice ?? ""));
  const [franchise, setFranchise] = useState(initial?.franchise ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [lowStockThreshold, setLowStockThreshold] = useState(String(initial?.lowStockThreshold ?? 5));
  const [isPreorder, setIsPreorder] = useState(initial?.isPreorder ?? false);
  const [preorderShipDate, setPreorderShipDate] = useState(initial?.preorderShipDate ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isBestseller, setIsBestseller] = useState(initial?.isBestseller ?? false);
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [videos, setVideos] = useState<string[]>(initial?.videos ?? []);
  const [specsRaw, setSpecsRaw] = useState(
    Object.entries(initial?.specs ?? {})
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n"),
  );

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function autoSlug(n: string) {
    return n
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function parseSpecs(raw: string): Record<string, string> {
    const specs: Record<string, string> = {};
    raw.split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return;
      specs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
    return specs;
  }

  async function uploadFile(file: File, folder: "images" | "videos"): Promise<string> {
    const storage = getStorage(getFirebaseApp());
    const storageRef = ref(storage, `products/${slug || "new"}/${folder}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async function handleImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadFile(f, "images")));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleCameraCapture(url: string, type: "image" | "video") {
    if (type === "image") setImages((prev) => [...prev, url]);
    else setVideos((prev) => [...prev, url]);
  }

  async function handleVideoFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadFile(f, "videos")));
      setVideos((prev) => [...prev, ...urls]);
    } catch {
      setError("Video upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !slug) {
      setError("Name and slug are required");
      return;
    }
    setLoading(true);
    try {
      const payload: ProductWritePayload = {
        name,
        slug,
        salePrice: parseFloat(salePrice) || 0,
        regularPrice: parseFloat(regularPrice) || 0,
        franchise,
        brand,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        description,
        specs: parseSpecs(specsRaw),
        stock: parseInt(stock) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        isPreorder,
        preorderShipDate: isPreorder ? preorderShipDate : undefined,
        isFeatured,
        isBestseller,
        inStock,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        images,
        videos,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-900">Basic Info</h3>
        <Input
          label="Product Name *"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!initial?.slug) setSlug(autoSlug(e.target.value));
          }}
          required
        />
        <Input
          label="Slug *"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sale Price (₹)"
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
          <Input
            label="Regular Price (₹)"
            type="number"
            value={regularPrice}
            onChange={(e) => setRegularPrice(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Franchise" value={franchise} onChange={(e) => setFranchise(e.target.value)} />
          <Input label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <Input
          label="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </section>

      {/* Description */}
      <section className="space-y-2">
        <h3 className="font-semibold text-gray-900">Description</h3>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product description (HTML allowed)"
        />
      </section>

      {/* Specs */}
      <section className="space-y-2">
        <h3 className="font-semibold text-gray-900">Specs</h3>
        <p className="text-xs text-gray-500">One spec per line: <code>Scale: 1:6</code></p>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
          value={specsRaw}
          onChange={(e) => setSpecsRaw(e.target.value)}
        />
      </section>

      {/* Inventory */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-900">Inventory</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stock Qty"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <Input
            label="Low Stock Threshold"
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <Checkbox label="In Stock" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          <Checkbox label="Pre-order" checked={isPreorder} onChange={(e) => setIsPreorder(e.target.checked)} />
          <Checkbox label="Featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          <Checkbox label="Bestseller" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} />
        </div>
        {isPreorder && (
          <Input
            label="Pre-order Ship Date (e.g. Q2 2026)"
            value={preorderShipDate}
            onChange={(e) => setPreorderShipDate(e.target.value)}
          />
        )}
      </section>

      {/* Images */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">Images</h3>
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-20 w-20 rounded object-cover border" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
            <span>Upload Images</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageFiles} />
          </label>
          <CameraCapture
            productSlug={slug || "new"}
            onCapture={handleCameraCapture}
            mode="image"
          />
        </div>
      </section>

      {/* Videos */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">Videos</h3>
        <div className="flex flex-wrap gap-2">
          {videos.map((url, i) => (
            <div key={i} className="relative group flex items-center gap-1 rounded border px-2 py-1 text-xs bg-gray-50">
              <span className="max-w-[120px] truncate">{url.split("/").pop()}</span>
              <button
                type="button"
                onClick={() => setVideos((prev) => prev.filter((_, j) => j !== i))}
                className="text-red-600 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
            <span>Upload Video</span>
            <input type="file" accept="video/*" className="sr-only" onChange={handleVideoFiles} />
          </label>
          <CameraCapture
            productSlug={slug || "new"}
            onCapture={handleCameraCapture}
            mode="video"
          />
        </div>
      </section>

      {/* SEO */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-900">SEO (optional)</h3>
        <Input label="SEO Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        <Input label="SEO Description" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
      </section>

      {uploading && <p className="text-sm text-amber-600">Uploading media…</p>}

      <Button type="submit" loading={loading} disabled={uploading}>
        {submitLabel}
      </Button>
    </form>
  );
}
