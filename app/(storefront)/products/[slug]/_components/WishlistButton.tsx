"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/cn";

interface WishlistButtonProps {
  productId: string;
}

export function WishlistButton({ productId }: WishlistButtonProps) {
  const { toggle, has } = useWishlist();
  const isWishlisted = has(productId);

  return (
    <button
      onClick={() => toggle(productId)}
      className={cn(
        "flex items-center gap-2 text-sm font-medium transition-colors",
        isWishlisted ? "text-red-600" : "text-gray-500 hover:text-red-600",
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        className="h-5 w-5"
        fill={isWishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
        />
      </svg>
      {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    </button>
  );
}
