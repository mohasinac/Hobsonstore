"use client";

import { useEffect, useState } from "react";
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/firebase/content";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { Button } from "@/components/ui/Button";
import type { Announcement } from "@/types/content";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await getAnnouncements();
    setItems(data.sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []); // load is a stable async data-fetch helper

  async function handleCreate(data: Omit<Announcement, "id">) {
    await createAnnouncement(data);
    setCreating(false);
    await load();
  }

  async function handleUpdate(data: Omit<Announcement, "id">) {
    if (!editing) return;
    await updateAnnouncement(editing.id, data);
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await deleteAnnouncement(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Announcements</h1>
        <Button size="sm" onClick={() => setCreating(true)}>+ New Announcement</Button>
      </div>

      {creating && (
        <div className="rounded-md border p-4">
          <AnnouncementForm onSubmit={handleCreate} submitLabel="Create" />
          <button onClick={() => setCreating(false)} className="mt-2 text-xs dark:text-slate-500 dark:hover:text-slate-300 text-gray-400">Cancel</button>
        </div>
      )}
      {editing && (
        <div className="rounded-md border p-4">
          <AnnouncementForm initial={editing} onSubmit={handleUpdate} submitLabel="Save" />
          <button onClick={() => setEditing(null)} className="mt-2 text-xs dark:text-slate-500 dark:hover:text-slate-300 text-gray-400">Cancel</button>
        </div>
      )}

      {loading ? <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p> : (
        <div className="space-y-2">
          {items.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-md border px-4 py-3" style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-ink)' }}>
              <div>
                <p className="font-medium text-sm">{a.message}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Sort: {a.sortOrder} · {a.active ? "Active" : "Hidden"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(a)} className="text-xs text-red-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(a.id)} className="text-xs dark:text-slate-500 text-gray-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No announcements yet.</p>}
        </div>
      )}
    </div>
  );
}
