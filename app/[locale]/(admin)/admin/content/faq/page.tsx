"use client";

import { useEffect, useState } from "react";
import { getFAQ, createFAQ, updateFAQ, deleteFAQ } from "@/lib/firebase/content";
import { revalidateContentCache } from "@/lib/actions/revalidate";
import { FAQForm } from "@/components/admin/FAQForm";
import { Button } from "@/components/ui/Button";
import type { FAQItem } from "@/types/content";

export default function AdminFAQPage() {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await getFAQ();
    setItems(data.sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []); // load is a stable async data-fetch helper

  async function handleCreate(data: Omit<FAQItem, "id">) {
    await createFAQ(data);
    void revalidateContentCache();
    setCreating(false);
    await load();
  }

  async function handleUpdate(data: Omit<FAQItem, "id">) {
    if (!editing) return;
    await updateFAQ(editing.id, data);
    void revalidateContentCache();
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    await deleteFAQ(id);
    void revalidateContentCache();
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>FAQ</h1>
        <Button size="sm" onClick={() => setCreating(true)}>+ New FAQ</Button>
      </div>

      {creating && (
        <div className="rounded-md border p-4">
          <FAQForm onSubmit={handleCreate} submitLabel="Create" />
          <button onClick={() => setCreating(false)} className="mt-2 text-xs dark:text-slate-500 dark:hover:text-slate-300 text-gray-400">Cancel</button>
        </div>
      )}
      {editing && (
        <div className="rounded-md border p-4">
          <FAQForm initial={editing} onSubmit={handleUpdate} submitLabel="Save" />
          <button onClick={() => setEditing(null)} className="mt-2 text-xs dark:text-slate-500 dark:hover:text-slate-300 text-gray-400">Cancel</button>
        </div>
      )}

      {loading ? <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p> : (
        <div className="space-y-2">
          {items.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-md border px-4 py-3" style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-ink)' }}>
              <div>
                <p className="font-medium text-sm">{f.question}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Sort: {f.sortOrder} · {f.active ? "Active" : "Hidden"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(f)} className="text-xs text-red-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(f.id)} className="text-xs dark:text-slate-500 text-gray-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No FAQ items yet.</p>}
        </div>
      )}
    </div>
  );
}
