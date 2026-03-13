"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllCollectionsAdmin, deleteCollection, updateCollectionOrder } from "@/lib/firebase/collections";
import { DraggableList } from "@/components/admin/DraggableList";
import { Button } from "@/components/ui/Button";
import type { Collection } from "@/types/content";

type CollectionItem = Collection & { id: string };

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCollectionsAdmin()
      .then((cols) => {
        const items = cols
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((c) => ({ ...c, id: c.slug }));
        setCollections(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleReorder(reordered: CollectionItem[]) {
    setCollections(reordered);
    Promise.all(reordered.map((c, i) => updateCollectionOrder(c.slug, i))).catch(console.error);
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete collection "${slug}"?`)) return;
    await deleteCollection(slug);
    setCollections((prev) => prev.filter((c) => c.slug !== slug));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Collections</h1>
        <Link href="/admin/collections/new">
          <Button size="sm">+ New Collection</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>
      ) : collections.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No collections yet.</p>
      ) : (
        <DraggableList<CollectionItem>
          items={collections}
          onReorder={handleReorder}
          renderItem={(c) => (
            <div className="flex items-center justify-between rounded-md border px-4 py-3" style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-ink)' }}>
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{c.slug}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/collections/${c.slug}`} className="text-xs text-red-600 hover:underline">Edit</Link>
                <button onClick={() => handleDelete(c.slug)} className="text-xs dark:text-slate-500 text-gray-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
