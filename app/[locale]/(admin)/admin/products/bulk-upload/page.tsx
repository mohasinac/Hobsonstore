"use client";

import { BulkUploadForm } from "@/components/admin/BulkUploadForm";

export default function BulkUploadPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Bulk Upload Products</h1>
      <BulkUploadForm />
    </div>
  );
}
