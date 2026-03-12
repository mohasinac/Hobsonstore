import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/formatCurrency";
import { ROUTES } from "@/constants/routes";
import type { OrderItem } from "@/types/order";

interface OrderItemListProps {
  items: OrderItem[];
}

export function OrderItemList({ items }: OrderItemListProps) {
  return (
    <ul className="divide-y" style={{ borderColor: 'var(--border-ink)' }}>
      {items.map((item, idx) => (
        <li key={`${item.productId}-${idx}`} className="flex gap-4 py-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden" style={{ border: '2px solid var(--border-ink)', background: 'var(--surface-warm)' }}>
            {item.image && (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain"
                sizes="64px"
              />
            )}
          </div>
          <div className="flex flex-1 flex-col justify-center gap-1">
            <Link
              href={ROUTES.PRODUCT(item.slug)}
              className="text-sm font-bold line-clamp-2"
              style={{ color: 'var(--color-black)' }}
            >
              {item.name}
            </Link>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Qty: {item.qty}</p>
          </div>
          <div className="shrink-0 text-sm font-bold" style={{ color: 'var(--color-red)' }}>
            {formatINR(item.salePrice * item.qty)}
          </div>
        </li>
      ))}
    </ul>
  );
}
