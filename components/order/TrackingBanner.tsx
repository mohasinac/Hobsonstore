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
    <div
      className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
      style={{
        border: '2px solid #0D0D0D',
        background: '#FFFEF0',
        boxShadow: '3px 3px 0px #0D0D0D',
      }}
    >
      <div>
        <p className="text-sm font-bold uppercase tracking-wide" style={{ color: '#0057FF', fontFamily: 'var(--font-bangers)', letterSpacing: '0.06em' }}>
          Shipment Dispatched 📦
        </p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-semibold" style={{ color: '#1A1A2E' }}>
          {courierName && <span>Courier: <strong>{courierName}</strong></span>}
          {trackingNumber && <span>AWB: <strong>{trackingNumber}</strong></span>}
        </div>
      </div>

      {trackingUrl && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white"
          style={{
            background: '#E8001C',
            border: '2px solid #0D0D0D',
            boxShadow: '3px 3px 0px #0D0D0D',
          }}
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
