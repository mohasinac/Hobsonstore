"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllFranchisesAdmin, deleteFranchise, updateFranchiseOrder } from "@/lib/firebase/franchises";
import { DraggableList } from "@/components/admin/DraggableList";
import { Button } from "@/components/ui/Button";
import type { Franchise } from "@/types/franchise";

type FranchiseItem = Franchise & { id: string };

export default function AdminFranchisesPage() {
  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllFranchisesAdmin().then((items) => {
      setFranchises(
        items
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((f) => ({ ...f, id: f.slug }))
      );
      setLoading(false);
    });
  }, []);

  function handleReorder(reordered: FranchiseItem[]) {
    setFranchises(reordered);
    Promise.all(reordered.map((f, i) => updateFranchiseOrder(f.slug, i))).catch(console.error);
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete franchise "${slug}"?`)) return;
    await deleteFranchise(slug);
    setFranchises((prev) => prev.filter((f) => f.slug !== slug));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Franchises</h1>
        <Link href="/admin/franchises/new">
          <Button size="sm">+ New Franchise</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : franchises.length === 0 ? (
        <p className="text-sm text-gray-400">No franchises yet.</p>
      ) : (
        <DraggableList<FranchiseItem>
          items={franchises}
          onReorder={handleReorder}
          renderItem={(f) => (
            <div className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
              <div>
                <p className="font-medium text-sm">{f.name}</p>
                <p className="text-xs text-gray-400">{f.slug} · {f.active ? "active" : "inactive"}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/franchises/${f.slug}`} className="text-xs text-red-600 hover:underline">Edit</Link>
                <button onClick={() => handleDelete(f.slug)} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
