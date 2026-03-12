"use client";

import { useEffect, useState } from "react";
import {
  getHomeSections, createHomeSection, updateHomeSection, deleteHomeSection,
} from "@/lib/firebase/content";
import { HomeSectionForm } from "@/components/admin/HomeSectionForm";
import { Button } from "@/components/ui/Button";
import type { HomeSection } from "@/types/content";

export default function AdminHomeSectionsPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [editing, setEditing] = useState<HomeSection | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const items = await getHomeSections();
    setSections(items.sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []); // load is a stable async data-fetch helper

  async function handleCreate(data: Omit<HomeSection, "id">) {
    await createHomeSection(data);
    setCreating(false);
    await load();
  }

  async function handleUpdate(data: Omit<HomeSection, "id">) {
    if (!editing) return;
    await updateHomeSection(editing.id, data);
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this section?")) return;
    await deleteHomeSection(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Home Sections</h1>
        <Button size="sm" onClick={() => setCreating(true)}>+ New Section</Button>
      </div>

      {creating && (
        <div className="rounded-md border p-4">
          <h2 className="font-medium mb-4">New Section</h2>
          <HomeSectionForm onSubmit={handleCreate} submitLabel="Create" />
          <button onClick={() => setCreating(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {editing && (
        <div className="rounded-md border p-4">
          <h2 className="font-medium mb-4">Edit: {editing.title}</h2>
          <HomeSectionForm initial={editing} onSubmit={handleUpdate} submitLabel="Save Changes" />
          <button onClick={() => setEditing(null)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="space-y-2">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
              <div>
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-xs text-gray-400">{s.type} · Sort: {s.sortOrder} · {s.active ? "Active" : "Hidden"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(s)} className="text-xs text-red-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(s.id)} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
          {sections.length === 0 && <p className="text-sm text-gray-400">No sections yet.</p>}
        </div>
      )}
    </div>
  );
}
