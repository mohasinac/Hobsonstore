import type { TrustBadge, TrustBadgeIconKey } from "@/types/content";

const BADGE_ICONS: Record<TrustBadgeIconKey, React.ReactNode> = {
  shipping: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M5 12H19" /><path d="M15 7l5 5-5 5" />
      <path d="M1 17V7a4 4 0 0 1 4-4h10" /><path d="M22 17a4 4 0 0 1-4 4H5" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  rewards: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  secure: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

const FALLBACK_BADGES: TrustBadge[] = [
  { id: "shipping", title: "Free Shipping", sub: "On orders above ₹5,000", iconKey: "shipping", sortOrder: 1, active: true },
  { id: "support", title: "Expert Support", sub: "Mon – Sat, 10 AM – 7 PM", iconKey: "support", sortOrder: 2, active: true },
  { id: "rewards", title: "Loyalty Rewards", sub: "Earn points on every order", iconKey: "rewards", sortOrder: 3, active: true },
  { id: "secure", title: "Secure Payments", sub: "UPI · Cards · EMI available", iconKey: "secure", sortOrder: 4, active: true },
];

interface TrustBadgesProps {
  badges?: TrustBadge[];
}

export function TrustBadges({ badges }: TrustBadgesProps) {
  const displayBadges = badges && badges.length > 0 ? badges : FALLBACK_BADGES;

  return (
    <section
      style={{
        background: "var(--section-bg)",
        borderTop: "var(--section-border)",
        borderBottom: "var(--section-border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {displayBadges.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:text-left sm:gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "rgba(240,196,23,0.12)",
                  color: "var(--color-red)",
                  border: "2px solid var(--border-ink)",
                }}
              >
                {BADGE_ICONS[badge.iconKey]}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wide" style={{ color: "var(--section-title-color)" }}>
                  {badge.title}
                </p>
                <p className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
                  {badge.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
