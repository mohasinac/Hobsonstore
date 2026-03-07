import { ORDER_STATUS_LABELS } from "@/constants/orderStatus";
import type { Order, OrderStatusEvent } from "@/types/order";
import type { OrderStatusConfig } from "@/types/config";

interface OrderStatusStepperProps {
  order: Order;
  /** Live configs from Firestore — falls back to static labels if empty */
  configs?: OrderStatusConfig[];
}

/** Ordered list of all possible non-terminal statuses shown in the stepper */
const STEPPER_STATUSES = [
  "pending_payment",
  "payment_confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

const CANCELLED_STATUSES = ["cancelled", "refund_initiated"] as const;

function isCancelled(status: string): boolean {
  return CANCELLED_STATUSES.includes(status as (typeof CANCELLED_STATUSES)[number]);
}

function formatTimestamp(event: OrderStatusEvent): string {
  if (!event.timestamp) return "";
  const seconds = (event.timestamp as { seconds: number }).seconds;
  return new Date(seconds * 1000).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderStatusStepper({ order, configs = [] }: OrderStatusStepperProps) {
  const labelFor = (status: string): string => {
    const cfg = configs.find((c) => c.status === status);
    return cfg?.label ?? ORDER_STATUS_LABELS[status] ?? status;
  };

  const eventFor = (status: string): OrderStatusEvent | undefined =>
    order.statusHistory?.find((e) => e.status === status);

  const cancelled = isCancelled(order.currentStatus);

  if (cancelled) {
    return (
      <div className="space-y-4">
        <div className="p-4" style={{ border: '2px solid #E8001C', background: '#FFF0F0', boxShadow: '3px 3px 0px #0D0D0D' }}>
          <p className="font-bold" style={{ color: '#E8001C' }}>
            {labelFor(order.currentStatus)}
          </p>
          {eventFor(order.currentStatus) && (
            <p className="mt-1 text-xs text-red-500">
              {formatTimestamp(eventFor(order.currentStatus)!)}
            </p>
          )}
          {eventFor(order.currentStatus)?.note && (
            <p className="mt-1 text-sm text-red-600">
              {eventFor(order.currentStatus)!.note}
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentIndex = STEPPER_STATUSES.indexOf(
    order.currentStatus as (typeof STEPPER_STATUSES)[number],
  );

  return (
    <ol className="relative ml-3 border-l-2" style={{ borderColor: '#0D0D0D' }}>
      {STEPPER_STATUSES.map((status, idx) => {
        const isDone = idx <= currentIndex;
        const isActive = idx === currentIndex;
        const event = eventFor(status);

        return (
          <li key={status} className="mb-8 ml-6 last:mb-0">
            {/* Circle */}
            <span
              className="absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                border: '2px solid #0D0D0D',
                background: isDone
                  ? isActive
                    ? '#E8001C'
                    : '#16A34A'
                  : '#FFFEF0',
                color: isDone ? '#FFFFFF' : '#6B6B6B',
              }}
            >
              {isDone && !isActive ? (
                // Checkmark
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" />
              )}
            </span>

            <div className="pl-1">
              <p
                className="text-sm font-bold"
                style={{
                  color: isActive ? '#E8001C' : isDone ? '#1A1A2E' : '#6B6B6B',
                }}
              >
                {labelFor(status)}
              </p>
              {event && (
                <time className="block text-xs" style={{ color: '#6B6B6B' }}>
                  {formatTimestamp(event)}
                </time>
              )}
              {event?.note && (
                <p className="mt-0.5 text-xs" style={{ color: '#6B6B6B' }}>{event.note}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
