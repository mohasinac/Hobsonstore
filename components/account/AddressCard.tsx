"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { removeAddress } from "@/lib/firebase/users";
import type { Address } from "@/types/order";

interface AddressCardProps {
  address: Address & { id: string; isDefault: boolean };
  uid: string;
  onRemoved?: (id: string) => void;
}

export function AddressCard({ address, uid, onRemoved }: AddressCardProps) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeAddress(uid, address);
      onRemoved?.(address.id);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="relative rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      {address.isDefault && (
        <span className="absolute right-4 top-4 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
          Default
        </span>
      )}
      <p className="font-semibold text-gray-900">{address.name}</p>
      <p className="mt-1 text-sm text-gray-600">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
      </p>
      <p className="text-sm text-gray-600">
        {address.city}, {address.state} – {address.pincode}
      </p>
      <p className="text-sm text-gray-600">{address.phone}</p>
      <Button
        variant="ghost"
        onClick={handleRemove}
        loading={removing}
        className="mt-3 text-xs text-red-600 hover:text-red-700"
      >
        Remove
      </Button>
    </div>
  );
}
