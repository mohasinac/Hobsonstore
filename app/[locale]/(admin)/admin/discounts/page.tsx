"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllDiscounts, deleteDiscount, toggleDiscount } from "@/lib/firebase/discounts";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/formatCurrency";
import type { Discount } from "@/types/config";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllDiscounts().then((d) => {
      setDiscounts(d);
      setLoading(false);
    });
  }, []);

  async function handleDelete(code: string) {
    if (!confirm(`Delete discount "${code}"?`)) return;
    await deleteDiscount(code);
    setDiscounts((prev) => prev.filter((d) => d.code !== code));
  }

  async function handleToggle(code: string, active: boolean) {
    await toggleDiscount(code, active);
    setDiscounts((prev) => prev.map((d) => d.code === code ? { ...d, active } : d));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Discounts</h1>
        <Link href="/admin/discounts/new">
          <Button size="sm">+ New Discount</Button>
        </Link>
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Value</th>
                <th className="px-4 py-2 text-right">Used</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {discounts.map((d) => (
                <tr key={d.code} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono font-bold">{d.code}</td>
                  <td className="px-4 py-2 capitalize">{d.type}</td>
                  <td className="px-4 py-2 text-right">{d.type === "percent" ? `${d.value}%` : formatINR(d.value)}</td>
                  <td className="px-4 py-2 text-right">{d.usedCount}{d.maxUses ? ` / ${d.maxUses}` : ""}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleToggle(d.code, !d.active)} className={`text-xs rounded-full px-2 py-0.5 ${d.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {d.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleDelete(d.code)} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {discounts.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No discounts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
