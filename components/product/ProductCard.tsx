"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { formatINR } from "@/lib/formatCurrency";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { slug, name, images, salePrice, regularPrice, inStock, isPreorder, franchise, brand, description } =
    product;
  const firstImage = images[0] ?? "/placeholder.png";
  const secondImage = images[1] ?? firstImage;
  const isOnSale = salePrice < regularPrice;

  return (
    <Link
      href={ROUTES.PRODUCT(slug)}
      className="group relative product-card"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden product-card__img-bg">
        <Image
          src={firstImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain transition-opacity duration-300 group-hover:opacity-0"
        />
        <Image
          src={secondImage}
          alt={`${name} (alternate view)`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="absolute inset-0 object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Overlays */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isOnSale && <Badge variant="sale">Sale</Badge>}
          {isPreorder && <Badge variant="preorder">Pre-order</Badge>}
          {!inStock && !isPreorder && <Badge variant="soldout">Sold Out</Badge>}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1 p-3 product-card__divider">
        <p className="line-clamp-2 text-sm font-bold product-card__name">
          {name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="font-black"
            style={{ color: "var(--color-red)", fontSize: "0.95rem" }}
          >
            {formatINR(salePrice)}
          </span>
          {isOnSale && (
            <span className="text-xs line-through" style={{ color: "var(--color-muted)" }}>
              {formatINR(regularPrice)}
            </span>
          )}
        </div>
        {(franchise || brand) && (
          <p className="text-xs truncate" style={{ color: "var(--color-muted)" }}>
            {franchise && <span>{franchise}</span>}
            {franchise && brand && <span> · </span>}
            {brand && <span>{brand}</span>}
          </p>
        )}
        {description && (
          <p
            className="line-clamp-2 text-xs leading-relaxed"
            style={{ color: "var(--color-muted)" }}
          >
            {description.replace(/<[^>]+>/g, "")}
          </p>
        )}
      </div>
    </Link>
  );
}
