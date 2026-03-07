interface TrackingBannerProps {
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

const SHIPPED_STATUSES = ["shipped", "out_for_delivery", "delivered"];

export function TrackingBanner({
  courierName,
  trackingNumber,
  trackingUrl,
}: TrackingBannerProps) {
  if (!trackingNumber && !courierName) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-indigo-800">Shipment Dispatched</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-indigo-700">
          {courierName && <span>Courier: <strong>{courierName}</strong></span>}
          {trackingNumber && <span>AWB: <strong>{trackingNumber}</strong></span>}
        </div>
      </div>

      {trackingUrl && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Track Shipment
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      )}
    </div>
  );
}

export { SHIPPED_STATUSES };
