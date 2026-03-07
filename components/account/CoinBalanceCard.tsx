import Link from "next/link";
import { formatINR } from "@/lib/formatCurrency";
import { ROUTES } from "@/constants/routes";

interface CoinBalanceCardProps {
  balance: number;
}

export function CoinBalanceCard({ balance }: CoinBalanceCardProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            FCC Coins
          </p>
          <p className="mt-1 text-3xl font-extrabold text-amber-700">
            {balance.toLocaleString("en-IN")}
          </p>
          <p className="mt-0.5 text-xs text-amber-600">
            ≈ {formatINR(balance)} redeemable
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-200 text-2xl">
          🪙
        </div>
      </div>
      <Link
        href={ROUTES.ACCOUNT_ORDERS}
        className="mt-3 block text-xs font-medium text-amber-700 hover:underline"
      >
        View coin history →
      </Link>
    </div>
  );
}
