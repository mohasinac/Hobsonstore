import Link from "next/link";
import { ROUTES } from "@/constants/routes";

interface EmptyCartProps {
  onClose?: () => void;
}

export function EmptyCart({ onClose }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <svg
        className="h-12 w-12 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-9l2 9"
        />
      </svg>
      <p className="font-medium text-gray-900">Your cart is empty</p>
      <Link
        href={ROUTES.COLLECTION("all")}
        onClick={onClose}
        className="text-sm text-red-600 hover:underline"
      >
        Continue shopping
      </Link>
    </div>
  );
}
