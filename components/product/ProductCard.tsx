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
      className="group relative flex flex-col overflow-hidden bg-white transition-all"
      style={{
        border: "3px solid #0D0D0D",
        boxShadow: "4px 4px 0px #0D0D0D",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translate(-2px,-2px)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "6px 6px 0px #0D0D0D";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "4px 4px 0px #0D0D0D";
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden" style={{ background: "#F5F5F0" }}>
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
      <div
        className="flex flex-col gap-1 p-3"
        style={{ borderTop: "2px solid #0D0D0D" }}
      >
        <p
          className="line-clamp-2 text-sm font-bold"
          style={{ color: "#0D0D0D" }}
        >
          {name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="font-black"
            style={{ color: "#E8001C", fontSize: "0.95rem" }}
          >
            {formatINR(salePrice)}
          </span>
          {isOnSale && (
            <span className="text-xs line-through" style={{ color: "#9CA3AF" }}>
              {formatINR(regularPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
