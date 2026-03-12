"use client";

import { useEffect, useState } from "react";
import { getBanners, createBanner, updateBanner, deleteBanner } from "@/lib/firebase/content";
import { BannerForm } from "@/components/admin/BannerForm";
import { Button } from "@/components/ui/Button";
import type { Banner } from "@/types/content";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const items = await getBanners();
    setBanners(items.sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []); // load is a stable async data-fetch helper

  async function handleCreate(data: Omit<Banner, "id">) {
    await createBanner(data);
    setCreating(false);
    await load();
  }

  async function handleUpdate(data: Omit<Banner, "id">) {
    if (!editing) return;
    await updateBanner(editing.id, data);
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    await deleteBanner(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Banners</h1>
        <Button size="sm" onClick={() => setCreating(true)}>+ New Banner</Button>
      </div>

      {creating && (
        <div className="rounded-md border p-4">
          <h2 className="font-medium mb-4">New Banner</h2>
          <BannerForm onSubmit={handleCreate} submitLabel="Create" />
          <button onClick={() => setCreating(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {editing && (
        <div className="rounded-md border p-4">
          <h2 className="font-medium mb-4">Edit Banner</h2>
          <BannerForm initial={editing} onSubmit={handleUpdate} submitLabel="Save Changes" />
          <button onClick={() => setEditing(null)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="space-y-2">
          {banners.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
              <div>
                <p className="font-medium text-sm">{b.title}</p>
                <p className="text-xs text-gray-400">Sort: {b.sortOrder} · {b.active ? "Active" : "Hidden"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(b)} className="text-xs text-red-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(b.id)} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
          {banners.length === 0 && <p className="text-sm text-gray-400">No banners yet.</p>}
        </div>
      )}
    </div>
  );
}
