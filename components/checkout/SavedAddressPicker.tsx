"use client";

import type { Address } from "@/types/order";
import type { User } from "@/types/user";

interface SavedAddressPickerProps {
  user: User | null;
  onSelect: (address: Address) => void;
}

export function SavedAddressPicker({ user, onSelect }: SavedAddressPickerProps) {
  if (!user || user.addresses.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-gray-800">Saved Addresses</p>
      <div className="flex flex-col gap-2">
        {user.addresses.map((addr) => (
          <button
            key={addr.id}
            type="button"
            onClick={() =>
              onSelect({
                name: addr.name,
                phone: addr.phone,
                line1: addr.line1,
                line2: addr.line2,
                city: addr.city,
                state: addr.state,
                pincode: addr.pincode,
              })
            }
            className="rounded-md border border-gray-200 px-4 py-2 text-left text-sm hover:border-red-400 hover:bg-red-50 transition"
          >
            <span className="font-medium">{addr.name}</span>
            {addr.isDefault && (
              <span className="ml-2 text-xs text-red-600 font-semibold">Default</span>
            )}
            <br />
            <span className="text-gray-500">
              {addr.line1}, {addr.city} - {addr.pincode}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
