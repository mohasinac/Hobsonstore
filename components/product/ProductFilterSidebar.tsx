"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ProductSortOption } from "@/types/product";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "az", label: "A – Z" },
  { value: "za", label: "Z – A" },
];

interface ProductFilterSidebarProps {
  franchises?: { slug: string; name: string }[];
  brands?: { slug: string; name: string }[];
}

export function ProductFilterSidebar({
  franchises = [],
  brands = [],
}: ProductFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = {
    sort: (params.get("sort") as ProductSortOption) ?? "featured",
    inStock: params.get("inStock") === "true",
    priceMin: params.get("priceMin") ?? "",
    priceMax: params.get("priceMax") ?? "",
    franchise: params.get("franchise") ?? "",
    brand: params.get("brand") ?? "",
  };

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === "") {
          sp.delete(key);
        } else {
          sp.set(key, val);
        }
      }
      sp.delete("page"); // reset pagination on filter change
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router],
  );

  function clearAll() {
    router.push(pathname);
  }

  const hasFilters =
    current.inStock ||
    current.priceMin !== "" ||
    current.priceMax !== "" ||
    current.franchise !== "" ||
    current.brand !== "";

  return (
    <aside className="flex flex-col gap-6 text-sm">
      {/* Sort */}
      <div>
        <p className="mb-2 font-black uppercase" style={{ color: "#0D0D0D", fontSize: "0.8rem", letterSpacing: "0.06em" }}>Sort by</p>
        <Select
          options={SORT_OPTIONS}
          value={current.sort}
          onChange={(e) => push({ sort: e.target.value })}
        />
      </div>

      {/* Availability */}
      <div>
        <p className="mb-2 font-black uppercase" style={{ color: "#0D0D0D", fontSize: "0.8rem", letterSpacing: "0.06em" }}>Availability</p>
        <Checkbox
          label="In stock only"
          checked={current.inStock}
          onChange={(e) => push({ inStock: e.target.checked ? "true" : null })}
        />
      </div>

      {/* Price range */}
      <div>
        <p className="mb-2 font-black uppercase" style={{ color: "#0D0D0D", fontSize: "0.8rem", letterSpacing: "0.06em" }}>Price (₹)</p>
        <div className="flex gap-2">
          <Input
            label="Min"
            type="number"
            min={0}
            value={current.priceMin}
            onChange={(e) => push({ priceMin: e.target.value || null })}
          />
          <Input
            label="Max"
            type="number"
            min={0}
            value={current.priceMax}
            onChange={(e) => push({ priceMax: e.target.value || null })}
          />
        </div>
      </div>

      {/* Franchise filter (shown only when franchises are provided) */}
      {franchises.length > 0 && (
        <div>
          <p className="mb-2 font-black uppercase" style={{ color: "#0D0D0D", fontSize: "0.8rem", letterSpacing: "0.06em" }}>Franchise</p>
          <Select
            placeholder="All franchises"
            options={franchises.map((f) => ({ value: f.slug, label: f.name }))}
            value={current.franchise}
            onChange={(e) => push({ franchise: e.target.value || null })}
          />
        </div>
      )}

      {/* Brand filter (shown only when brands are provided) */}
      {brands.length > 0 && (
        <div>
          <p className="mb-2 font-black uppercase" style={{ color: "#0D0D0D", fontSize: "0.8rem", letterSpacing: "0.06em" }}>Brand</p>
          <Select
            placeholder="All brands"
            options={brands.map((b) => ({ value: b.slug, label: b.name }))}
            value={current.brand}
            onChange={(e) => push({ brand: e.target.value || null })}
          />
        </div>
      )}

      {hasFilters && (
        <Button variant="ghost" onClick={clearAll} className="text-xs">
          Clear all filters
        </Button>
      )}
    </aside>
  );
}
