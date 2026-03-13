"use client";

import { useEffect, useState } from "react";
import { getTrustBadges, createTrustBadge, updateTrustBadge, deleteTrustBadge } from "@/lib/firebase/content";
import { TrustBadgeForm } from "@/components/admin/TrustBadgeForm";
import { Button } from "@/components/ui/Button";
import type { TrustBadge } from "@/types/content";

export default function AdminTrustBadgesPage() {
  const [items, setItems] = useState<TrustBadge[]>([]);
  const [editing, setEditing] = useState<TrustBadge | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await getTrustBadges();
    setItems(data.sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []); // load is a stable async data-fetch helper

  async function handleCreate(data: Omit<TrustBadge, "id">) {
    await createTrustBadge(data);
    setCreating(false);
    await load();
  }

  async function handleUpdate(data: Omit<TrustBadge, "id">) {
    if (!editing) return;
    await updateTrustBadge(editing.id, data);
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this trust badge?")) return;
    await deleteTrustBadge(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Trust Badges</h1>
        <Button size="sm" onClick={() => setCreating(true)}>+ New Badge</Button>
      </div>

      {creating && (
        <div className="rounded-md border p-4">
          <h2 className="font-medium mb-4">New Trust Badge</h2>
          <TrustBadgeForm onSubmit={handleCreate} submitLabel="Create" />
          <button onClick={() => setCreating(false)} className="mt-2 text-xs dark:text-slate-500 dark:hover:text-slate-300 text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {editing && (
        <div className="rounded-md border p-4">
          <h2 className="font-medium mb-4">Edit Trust Badge</h2>
          <TrustBadgeForm initial={editing} onSubmit={handleUpdate} submitLabel="Save Changes" />
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
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Sort: {item.sortOrder} · {item.active ? "Active" : "Hidden"} · Icon: {item.iconKey}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{item.sub}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(item)} className="text-xs text-red-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-xs dark:text-slate-500 text-gray-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No trust badges yet.</p>}
        </div>
      )}
    </div>
  );
}
