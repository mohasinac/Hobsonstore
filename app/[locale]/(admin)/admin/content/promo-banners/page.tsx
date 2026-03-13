"use client";

import { useEffect, useState } from "react";
import { getPromoBanners, createPromoBanner, updatePromoBanner, deletePromoBanner } from "@/lib/firebase/content";
import { PromoBannerForm } from "@/components/admin/PromoBannerForm";
import { Button } from "@/components/ui/Button";
import type { PromoBanner } from "@/types/content";

export default function AdminPromoBannersPage() {
  const [items, setItems] = useState<PromoBanner[]>([]);
  const [editing, setEditing] = useState<PromoBanner | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await getPromoBanners();
    setItems(data.sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []); // load is a stable async data-fetch helper

  async function handleCreate(data: Omit<PromoBanner, "id">) {
    await createPromoBanner(data);
    setCreating(false);
    await load();
  }

  async function handleUpdate(data: Omit<PromoBanner, "id">) {
    if (!editing) return;
    await updatePromoBanner(editing.id, data);
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promo banner?")) return;
    await deletePromoBanner(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Promo Banners</h1>
        <Button size="sm" onClick={() => setCreating(true)}>+ New Promo Banner</Button>
      </div>

      {creating && (
        <div className="rounded-md border p-4">
          <h2 className="font-medium mb-4">New Promo Banner</h2>
          <PromoBannerForm onSubmit={handleCreate} submitLabel="Create" />
          <button onClick={() => setCreating(false)} className="mt-2 text-xs dark:text-slate-500 dark:hover:text-slate-300 text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {editing && (
        <div className="rounded-md border p-4">
          <h2 className="font-medium mb-4">Edit Promo Banner</h2>
          <PromoBannerForm initial={editing} onSubmit={handleUpdate} submitLabel="Save Changes" />
          <button onClick={() => setEditing(null)} className="mt-2 text-xs dark:text-slate-500 dark:hover:text-slate-300 text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border px-4 py-3" style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-ink)' }}>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Sort: {item.sortOrder} · {item.active ? "Active" : "Hidden"} · {item.ctaUrl}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(item)} className="text-xs text-red-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-xs dark:text-slate-500 text-gray-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm dark:text-slate-500 text-gray-400">No promo banners yet.</p>}
        </div>
      )}
    </div>
  );
}
