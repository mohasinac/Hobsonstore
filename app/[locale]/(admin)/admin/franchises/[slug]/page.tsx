"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFranchise, upsertFranchise } from "@/lib/firebase/franchises";
import { FranchiseForm } from "@/components/admin/FranchiseForm";
import type { Franchise } from "@/types/franchise";

export default function EditFranchisePage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params
      .then(({ slug }) => getFranchise(slug))
      .then((f) => {
        setFranchise(f);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params]);

  async function handleSubmit(data: Franchise) {
    await upsertFranchise(data.slug, data);
    router.push("/admin/franchises");
  }

  if (loading) return <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>;
  if (!franchise) return <p className="text-sm text-red-600">Franchise not found.</p>;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Edit: {franchise.name}</h1>
      <FranchiseForm initial={franchise} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}
