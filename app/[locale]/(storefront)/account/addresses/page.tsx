"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUser, addAddress } from "@/lib/firebase/users";
import { AddressCard } from "@/components/account/AddressCard";
import { AddressForm } from "@/components/checkout/AddressForm";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/constants/routes";
import type { User } from "@/types/user";
import type { Address } from "@/types/order";

const EMPTY_ADDRESS: Address = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);

  const load = (uid: string) =>
    getUser(uid)
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (user) load(user.uid);
  }, [user, authLoading, router]);

  async function handleAdd() {
    if (!user) return;
    setSaving(true);
    try {
      await addAddress(user.uid, {
        ...newAddress,
        id: crypto.randomUUID(),
        isDefault: (profile?.addresses ?? []).length === 0,
      });
      setNewAddress(EMPTY_ADDRESS);
      setShowForm(false);
      load(user.uid);
    } finally {
      setSaving(false);
    }
  }

  function handleRemoved() {
    if (user) load(user.uid);
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const addresses = profile?.addresses ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-bangers)', color: '#1A1A2E', letterSpacing: '0.06em' }}>My Addresses</h1>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            + Add Address
          </Button>
        )}
      </div>

      {/* Add address form */}
      {showForm && (
        <div className="bg-white p-6" style={{ border: '2px solid #0D0D0D', boxShadow: '3px 3px 0px #0D0D0D' }}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest" style={{ color: '#6B6B6B' }}>
            New Address
          </h2>
          <AddressForm value={newAddress} onChange={setNewAddress} />
          <div className="mt-5 flex gap-3">
            <Button variant="primary" loading={saving} onClick={handleAdd}>
              Save Address
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setNewAddress(EMPTY_ADDRESS);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Existing addresses */}
      {addresses.length === 0 && !showForm ? (
        <div className="py-16 text-center" style={{ border: '2px dashed #0D0D0D' }}>
          <p className="text-lg font-bold" style={{ color: '#1A1A2E' }}>
            No saved addresses yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              uid={user!.uid}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
