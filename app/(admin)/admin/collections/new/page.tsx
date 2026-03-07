"use client";

import { useRouter } from "next/navigation";
import { upsertCollection } from "@/lib/firebase/collections";
import { CollectionForm } from "@/components/admin/CollectionForm";
import type { Collection } from "@/types/content";

export default function NewCollectionPage() {
  const router = useRouter();

  async function handleSubmit(data: Omit<Collection, "slug"> & { slug: string }) {
    await upsertCollection(data.slug, data);
    router.push("/admin/collections");
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">New Collection</h1>
      <CollectionForm onSubmit={handleSubmit} submitLabel="Create Collection" />
    </div>
  );
}
