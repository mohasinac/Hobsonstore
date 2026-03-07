"use client";

import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { ROUTES } from "@/constants/routes";
import type { Collection } from "@/types/content";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  franchiseCollections: Collection[];
  brandCollections: Collection[];
}

export function MobileMenu({
  open,
  onClose,
  franchiseCollections,
  brandCollections,
}: MobileMenuProps) {
  return (
    <Drawer open={open} onClose={onClose} side="left">
      <div className="p-4">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-bold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            Franchise
          </p>
          <div className="flex flex-col gap-2">
            {franchiseCollections.map((c) => (
              <Link
                key={c.slug}
                href={ROUTES.COLLECTION(c.slug)}
                onClick={onClose}
                className="text-sm text-gray-700 hover:text-red-600"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            Brands
          </p>
          <div className="flex flex-col gap-2">
            {brandCollections.map((c) => (
              <Link
                key={c.slug}
                href={ROUTES.COLLECTION(c.slug)}
                onClick={onClose}
                className="text-sm text-gray-700 hover:text-red-600"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
