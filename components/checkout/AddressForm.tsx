"use client";

import { Input } from "@/components/ui/Input";
import type { Address } from "@/types/order";

interface AddressFormProps {
  value: Address;
  onChange: (updated: Address) => void;
}

export function AddressForm({ value, onChange }: AddressFormProps) {
  const field =
    (key: keyof Address) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, [key]: e.target.value });
    };

  return (
    <div className="flex flex-col gap-4">
      <Input label="Full name" value={value.name} onChange={field("name")} required />
      <Input
        label="Phone"
        value={value.phone}
        onChange={field("phone")}
        type="tel"
        required
      />
      <Input
        label="Address line 1"
        value={value.line1}
        onChange={field("line1")}
        required
      />
      <Input
        label="Address line 2 (optional)"
        value={value.line2 ?? ""}
        onChange={field("line2")}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={value.city} onChange={field("city")} required />
        <Input label="State" value={value.state} onChange={field("state")} required />
      </div>
      <Input
        label="Pincode"
        value={value.pincode}
        onChange={field("pincode")}
        maxLength={6}
        required
      />
    </div>
  );
}
