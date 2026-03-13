"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";
import { buildStatusNotificationURL } from "@/lib/whatsapp";
import { ORDER_STATUS_TRANSITIONS, ORDER_STATUS_LABELS } from "@/constants/orderStatus";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import type { Order, OrderStatus } from "@/types/order";
import type { OrderStatusConfig } from "@/types/config";

interface StatusChangeFormProps {
  order: Order;
  /** Firestore-driven config for WA templates; falls back to static labels */
  configs?: OrderStatusConfig[];
  onSuccess?: (newStatus: OrderStatus) => void;
}

export function StatusChangeForm({
  order,
  configs = [],
  onSuccess,
}: StatusChangeFormProps) {
  const validNext = (ORDER_STATUS_TRANSITIONS[order.currentStatus] ?? []) as OrderStatus[];

  const [newStatus, setNewStatus] = useState<OrderStatus>(validNext[0] ?? order.currentStatus);
  const [note, setNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? "");
  const [courierName, setCourierName] = useState(order.courierName ?? "");
  const [notifyWA, setNotifyWA] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labelFor = (s: string) => {
    const cfg = configs.find((c) => c.status === s);
    return cfg?.label ?? ORDER_STATUS_LABELS[s] ?? s;
  };

  const waPreviewUrl = (): string | null => {
    const cfg = configs.find((c) => c.status === newStatus);
    if (!cfg?.waTemplate || !order.address.phone) return null;
    return buildStatusNotificationURL(
      order.address.phone.replace(/\D/g, ""),
      cfg.waTemplate,
      {
        orderId: order.id,
        trackingNumber: trackingNumber || "—",
        customerName: order.address.name,
      },
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = getAuth(getFirebaseApp());
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not authenticated");

      const token = await currentUser.getIdToken();

      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newStatus,
          note: note.trim() || undefined,
          trackingNumber: trackingNumber.trim() || undefined,
          trackingUrl: trackingUrl.trim() || undefined,
          courierName: courierName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to update status");
      }

      // Open WA link if toggle is on and template exists
      if (notifyWA) {
        const url = waPreviewUrl();
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }

      onSuccess?.(newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (validNext.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        No further status transitions available.
      </p>
    );
  }

  const showsTracking = ["shipped", "out_for_delivery"].includes(newStatus);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="New status"
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
        options={validNext.map((s) => ({ value: s, label: labelFor(s) }))}
      />

      {showsTracking && (
        <>
          <Input
            label="Courier name"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            placeholder="e.g. Bluedart"
          />
          <Input
            label="AWB / Tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. 123456789"
          />
          <Input
            label="Tracking URL (optional)"
            type="url"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://..."
          />
        </>
      )}

      <Textarea
        label="Internal note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Add any relevant details…"
      />

      {waPreviewUrl() && (
        <Checkbox
          checked={notifyWA}
          onChange={(e) => setNotifyWA(e.target.checked)}
          label="Notify customer via WhatsApp"
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? "Updating…" : "Update Status"}
      </Button>
    </form>
  );
}
