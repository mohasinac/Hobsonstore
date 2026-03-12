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
    <div
      className="relative p-5"
      style={{
        background: "var(--surface-elevated)",
        border: "2px solid var(--border-ink)",
        boxShadow: "3px 3px 0px var(--border-ink)",
      }}
    >
      {address.isDefault && (
        <span
          className="absolute right-4 top-4 px-2 py-0.5 text-xs font-black uppercase"
          style={{ background: "var(--color-yellow)", border: "2px solid var(--border-ink)", color: "#1A1A1A" }}
        >
          Default
        </span>
      )}
      <p className="font-bold" style={{ color: "var(--color-black)" }}>{address.name}</p>
      <p className="mt-1 text-sm" style={{ color: "var(--color-black)" }}>
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
      </p>
      <p className="text-sm" style={{ color: "var(--color-black)" }}>
        {address.city}, {address.state} – {address.pincode}
      </p>
      <p className="text-sm" style={{ color: "var(--color-black)" }}>{address.phone}</p>
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
