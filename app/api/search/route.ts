import { NextRequest, NextResponse } from "next/server";
import { getProductsServer, getAllFranchisesServer, getAllBrandsServer } from "@/lib/firebase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], franchises: [], brands: [] });
  }

  const [allProducts, franchises, brands] = await Promise.all([
    getProductsServer({ sort: "newest" }, 200),
    getAllFranchisesServer(),
    getAllBrandsServer(),
  ]);

  const products = allProducts
    .filter((p) => {
      if (p.active === false) return false;
      return (
        p.name.toLowerCase().includes(q) ||
        p.franchise?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.description?.toLowerCase().includes(q)
      );
    })
    .slice(0, 5);

  const filteredFranchises = franchises
    .filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.slug.toLowerCase().includes(q) ||
        (f.description ?? "").toLowerCase().includes(q),
    )
    .slice(0, 5);

  const filteredBrands = brands
    .filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q),
    )
    .slice(0, 5);

  return NextResponse.json({
    products,
    franchises: filteredFranchises,
    brands: filteredBrands,
  });
}
