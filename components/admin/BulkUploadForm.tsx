"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ParsedRow {
  name: string;
  slug: string;
  salePrice: number;
  regularPrice: number;
  franchise: string;
  brand: string;
  tags: string[];
  stock: number;
  inStock: boolean;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    const stock = parseInt(row.stock ?? "0") || 0;
    return {
      name: row.name ?? "",
      slug: row.slug ?? (row.name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      salePrice: parseFloat(row["saleprice"] ?? row["sale_price"] ?? "0") || 0,
      regularPrice: parseFloat(row["regularprice"] ?? row["regular_price"] ?? "0") || 0,
      franchise: row.franchise ?? "",
      brand: row.brand ?? "",
      tags: (row.tags ?? "").split(";").map((t) => t.trim()).filter(Boolean),
      stock,
      inStock: stock > 0,
    };
  }).filter((r) => r.name);
}

interface BulkUploadFormProps {
  onUploaded?: (count: number) => void;
}

export function BulkUploadForm({ onUploaded }: BulkUploadFormProps) {
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setDone(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target?.result as string);
        setRows(parsed);
      } catch {
        setError("Failed to parse CSV");
      }
    };
    reader.readAsText(file);
  }

  async function handleSubmit() {
    if (!rows?.length) return;
    setUploading(true);
    setError(null);
    try {
      const { getAuth } = await import("firebase/auth");
      const { getFirebaseApp } = await import("@/lib/firebase/client");
      const auth = getAuth(getFirebaseApp());
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/admin/products/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rows }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Upload failed");
      }

      const result = (await res.json()) as { count: number };
      setDone(result.count);
      setRows(null);
      onUploaded?.(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 border-dashed p-6 text-center" style={{ borderColor: 'var(--border-ink)', opacity: 1 }}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-muted)' }}>
          CSV columns: <code className="text-xs px-1 rounded" style={{ background: 'var(--surface-warm)' }}>name, slug, salePrice, regularPrice, franchise, brand, tags (semicolon-separated), stock</code>
        </p>
        <label className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm dark:hover:bg-white/10 hover:bg-gray-50" style={{ border: '2px solid var(--border-ink)', background: 'var(--surface-elevated)', color: 'var(--color-black)' }}>
          <span>Choose CSV file</span>
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleFile} />
        </label>
        {fileName && <p className="mt-2 text-xs" style={{ color: 'var(--color-muted)' }}>{fileName}</p>}
      </div>

      {rows && rows.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-black)' }}>{rows.length} products to import</p>
          <div className="max-h-64 overflow-y-auto rounded-md border text-xs" style={{ borderColor: 'var(--border-ink)' }}>
            <table className="w-full">
              <thead className="sticky top-0" style={{ background: 'var(--surface-warm)' }}>
                <tr>
                  {["Name", "Slug", "Price", "Stock", "Brand"].map((h) => (
                    <th key={h} className="px-3 py-1.5 text-left font-medium" style={{ color: 'var(--color-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: 'var(--table-row-border)' }}>
                    <td className="px-3 py-1.5">{r.name}</td>
                    <td className="px-3 py-1.5" style={{ color: 'var(--color-muted)' }}>{r.slug}</td>
                    <td className="px-3 py-1.5">₹{r.salePrice}</td>
                    <td className="px-3 py-1.5">{r.stock}</td>
                    <td className="px-3 py-1.5">{r.brand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={handleSubmit} loading={uploading}>
              Import {rows.length} Products
            </Button>
            <Button variant="ghost" onClick={() => setRows(null)}>Clear</Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {done !== null && <p className="text-sm text-green-600">✓ {done} products imported successfully</p>}
    </div>
  );
}
