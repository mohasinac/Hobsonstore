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
    <ul className="divide-y" style={{ borderColor: '#0D0D0D' }}>
      {items.map((item, idx) => (
        <li key={`${item.productId}-${idx}`} className="flex gap-4 py-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden" style={{ border: '2px solid #0D0D0D', background: '#FFFEF0' }}>
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
              style={{ color: '#1A1A2E' }}
            >
              {item.name}
            </Link>
            <p className="text-xs font-semibold" style={{ color: '#6B6B6B' }}>Qty: {item.qty}</p>
          </div>
          <div className="flex-shrink-0 text-sm font-bold" style={{ color: '#E8001C' }}>
            {formatINR(item.salePrice * item.qty)}
          </div>
        </li>
      ))}
    </ul>
  );
}
