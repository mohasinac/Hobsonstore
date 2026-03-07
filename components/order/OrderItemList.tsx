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
    <ul className="divide-y divide-gray-100">
      {items.map((item, idx) => (
        <li key={`${item.productId}-${idx}`} className="flex gap-4 py-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
              className="text-sm font-medium text-gray-900 hover:text-red-600 line-clamp-2"
            >
              {item.name}
            </Link>
            <p className="text-xs text-gray-500">Qty: {item.qty}</p>
          </div>
          <div className="flex-shrink-0 text-sm font-semibold text-gray-900">
            {formatINR(item.salePrice * item.qty)}
          </div>
        </li>
      ))}
    </ul>
  );
}
