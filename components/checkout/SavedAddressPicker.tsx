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
      <p className="text-sm font-black uppercase" style={{ color: "#0D0D0D", letterSpacing: "0.04em" }}>Saved Addresses</p>
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
            className="px-4 py-2 text-left text-sm transition-all"
            style={{
              border: "2px solid #0D0D0D",
              boxShadow: "3px 3px 0px #0D0D0D",
              background: "#FFFFFF",
            }}
          >
            <span className="font-bold" style={{ color: "#0D0D0D" }}>{addr.name}</span>
            {addr.isDefault && (
              <span className="ml-2 text-xs font-black" style={{ color: "#E8001C" }}>Default</span>
            )}
            <br />
            <span style={{ color: "#6B6B6B" }}>
              {addr.line1}, {addr.city} - {addr.pincode}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
