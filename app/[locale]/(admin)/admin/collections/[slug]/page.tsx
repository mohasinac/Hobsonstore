"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCollection, upsertCollection } from "@/lib/firebase/collections";
import { revalidateContentCache } from "@/lib/actions/revalidate";
import { CollectionForm } from "@/components/admin/CollectionForm";
import type { Collection } from "@/types/content";

export default function EditCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ slug }) => {
      getCollection(slug).then((col) => {
        setCollection(col);
        setLoading(false);
      });
    });
  }, [params]);

  async function handleSubmit(data: Omit<Collection, "slug"> & { slug: string }) {
    await upsertCollection(data.slug, data);
    void revalidateContentCache();
    router.push("/admin/collections");
  }

  if (loading) return <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>;
  if (!collection) return <p className="text-sm text-red-600">Collection not found.</p>;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Edit: {collection.name}</h1>
      <CollectionForm initial={collection} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}
