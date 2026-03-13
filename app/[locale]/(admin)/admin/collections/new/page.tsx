"use client";

import { useRouter } from "next/navigation";
import { upsertCollection } from "@/lib/firebase/collections";
import { revalidateContentCache } from "@/lib/actions/revalidate";
import { CollectionForm } from "@/components/admin/CollectionForm";
import type { Collection } from "@/types/content";

export default function NewCollectionPage() {
  const router = useRouter();

  async function handleSubmit(data: Omit<Collection, "slug"> & { slug: string }) {
    await upsertCollection(data.slug, data);
    void revalidateContentCache();
    router.push("/admin/collections");
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>New Collection</h1>
      <CollectionForm onSubmit={handleSubmit} submitLabel="Create Collection" />
    </div>
  );
}
