"use client";

import { useRouter } from "next/navigation";
import { upsertFranchise } from "@/lib/firebase/franchises";
import { FranchiseForm } from "@/components/admin/FranchiseForm";
import type { Franchise } from "@/types/franchise";

export default function NewFranchisePage() {
  const router = useRouter();

  async function handleSubmit(data: Franchise) {
    await upsertFranchise(data.slug, data);
    router.push("/admin/franchises");
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">New Franchise</h1>
      <FranchiseForm onSubmit={handleSubmit} submitLabel="Create Franchise" />
    </div>
  );
}
