import { formatINR } from "@/lib/formatCurrency";
import type { CoinHistoryEntry } from "@/types/user";
import type { Timestamp } from "firebase/firestore";

interface CoinBalanceCardProps {
  balance: number;
  history?: CoinHistoryEntry[];
}

function formatTs(ts: Timestamp | undefined): string {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const REASON_LABELS: Record<CoinHistoryEntry["reason"], string> = {
  purchase: "Earned on order",
  redemption: "Redeemed on order",
  "admin-grant": "Admin grant",
  refund: "Refund credit",
};

export function CoinBalanceCard({
  balance,
  history = [],
}: CoinBalanceCardProps) {
  const recent = history
    .slice()
    .sort(
      (a, b) =>
        ((b.timestamp as Timestamp)?.seconds ?? 0) -
        ((a.timestamp as Timestamp)?.seconds ?? 0),
    )
    .slice(0, 5);

  return (
    <div
      className="p-5"
      style={{
        background: "#FFFEF0",
        border: "3px solid #0D0D0D",
        boxShadow: "4px 4px 0px #0D0D0D",
      }}
    >
      {/* Balance row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            FCC Coins
          </p>
          <p className="mt-1 text-3xl font-extrabold text-amber-700">
            {balance.toLocaleString("en-IN")}
          </p>
          <p className="mt-0.5 text-xs text-amber-600">
            &#x1F4B0; {formatINR(balance)} redeemable
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-200 text-2xl">
          &#x1FA99;
        </div>
      </div>

      {/* Recent history */}
      {recent.length > 0 && (
        <div className="mt-4 border-t border-amber-200 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-600">
            Recent Activity
          </p>
          <ul className="flex flex-col gap-1.5">
            {recent.map((entry, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-xs"
                style={{ color: "#1A1A2E" }}
              >
                <span>{REASON_LABELS[entry.reason] ?? entry.reason}</span>
                <span
                  className={
                    entry.delta >= 0
                      ? "font-semibold text-green-700"
                      : "font-semibold text-red-600"
                  }
                >
                  {entry.delta >= 0 ? "+" : ""}
                  {entry.delta.toLocaleString("en-IN")}
                  {entry.timestamp && (
                    <span className="ml-1.5 font-normal" style={{ color: '#6B6B6B' }}>
                      {formatTs(entry.timestamp as Timestamp)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
