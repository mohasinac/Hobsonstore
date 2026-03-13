"use client";

import { useEffect, useState } from "react";
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "@/lib/firebase/content";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { Button } from "@/components/ui/Button";
import type { Testimonial } from "@/types/content";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await getTestimonials();
    setItems(data.sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []); // load is a stable async data-fetch helper

  async function handleCreate(data: Omit<Testimonial, "id">) {
    await createTestimonial(data);
    setCreating(false);
    await load();
  }

  async function handleUpdate(data: Omit<Testimonial, "id">) {
    if (!editing) return;
    await updateTestimonial(editing.id, data);
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await deleteTestimonial(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Testimonials</h1>
        <Button size="sm" onClick={() => setCreating(true)}>+ New Testimonial</Button>
      </div>

      {creating && (
        <div className="rounded-md border p-4">
          <TestimonialForm onSubmit={handleCreate} submitLabel="Create" />
          <button onClick={() => setCreating(false)} className="mt-2 text-xs dark:text-slate-500 dark:hover:text-slate-300 text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}
      {editing && (
        <div className="rounded-md border p-4">
          <TestimonialForm initial={editing} onSubmit={handleUpdate} submitLabel="Save" />
          <button onClick={() => setEditing(null)} className="mt-2 text-xs dark:text-slate-500 dark:hover:text-slate-300 text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {loading ? <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p> : (
        <div className="space-y-2">
          {items.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md border px-4 py-3" style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-ink)' }}>
              <div>
                <p className="font-medium text-sm">{t.name} — {"★".repeat(t.rating)}</p>
                <p className="text-xs line-clamp-1" style={{ color: 'var(--color-muted)' }}>{t.text}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(t)} className="text-xs text-red-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(t.id)} className="text-xs dark:text-slate-500 text-gray-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No testimonials yet.</p>}
        </div>
      )}
    </div>
  );
}
