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
  const { slug, name, images, salePrice, regularPrice, inStock, isPreorder } =
    product;
  const firstImage = images[0] ?? "/placeholder.png";
  const secondImage = images[1] ?? firstImage;
  const isOnSale = salePrice < regularPrice;

  return (
    <Link
      href={ROUTES.PRODUCT(slug)}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
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
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-medium text-gray-900">{name}</p>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-red-600">
            {formatINR(salePrice)}
          </span>
          {isOnSale && (
            <span className="text-xs text-gray-400 line-through">
              {formatINR(regularPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
