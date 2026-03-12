"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Z_INDEX } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product";
import type { Franchise } from "@/types/franchise";
import type { Brand } from "@/types/brand";

// ── Types ────────────────────────────────────────────────────────────────────

interface SearchResults {
  products: Product[];
  franchises: Franchise[];
  brands: Brand[];
}

// ── Icons (inline SVG) ───────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
    </svg>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ResultGroup({
  label,
  accent,
  children,
}: {
  label: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div
        className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest"
        style={{ color: accent ?? "#E8001C", fontFamily: "var(--font-bangers, Bangers, cursive)", letterSpacing: "0.1em" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

const SITE_LINKS = [
  { label: "Shop All",   href: ROUTES.SEARCH,          keywords: ["shop", "all", "products", "buy", "catalog"] },
  { label: "Franchises", href: ROUTES.FRANCHISES,       keywords: ["franchise", "marvel", "dc", "tmnt", "star wars", "ip"] },
  { label: "Brands",     href: ROUTES.BRANDS,           keywords: ["brand", "hot toys", "sideshow", "bandai", "kotobukiya"] },
  { label: "Blog",       href: ROUTES.BLOG,             keywords: ["blog", "news", "article", "guide", "review", "read"] },
  { label: "About",      href: ROUTES.PAGE("about"),    keywords: ["about", "story", "company", "who are we"] },
  { label: "Contact",    href: ROUTES.PAGE("contact"),  keywords: ["contact", "support", "help", "email", "whatsapp"] },
];

// ── Main component ────────────────────────────────────────────────────────────

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when dialog opens; reset on close
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
      setLoading(false);
    }
  }, [open]);

  // Debounced API search
  const handleQuery = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data: SearchResults = await res.json();
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 280);
  }, []);

  const q = query.toLowerCase();
  const matchedLinks =
    q.length >= 1
      ? SITE_LINKS.filter(
          (l) => l.label.toLowerCase().includes(q) || l.keywords.some((k) => k.includes(q)),
        )
      : SITE_LINKS.slice(0, 5);

  const hasApiResults =
    results &&
    (results.products.length > 0 || results.franchises.length > 0 || results.brands.length > 0);

  function handleClose() {
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
    handleClose();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "hidden lg:flex items-center gap-1.5 rounded-md px-2 py-2 transition-colors",
        )}
        style={{ color: "#0D0D0D" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#0D0D0D";
          (e.currentTarget as HTMLButtonElement).style.color = "#FFE500";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#0D0D0D";
        }}
        aria-label="Search (Ctrl+K)"
      >
        <SearchIcon className="h-5 w-5" />
        <kbd
          className="hidden xl:inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ background: "rgba(0,0,0,0.12)", color: "inherit" }}
        >
          ⌘K
        </kbd>
      </button>
    );
  }

  return createPortal(
    <div className="fixed inset-0 flex items-start justify-center pt-[8vh] px-4" style={{ zIndex: Z_INDEX.MODAL + 10 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl overflow-hidden"
        style={{ background: "#FFFEF0", border: "3px solid #0D0D0D", boxShadow: "8px 8px 0px #0D0D0D" }}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "2px solid #0D0D0D" }}
        >
          <SearchIcon className="h-5 w-5 shrink-0 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder="Search collectibles, brands, franchises…"
            className="flex-1 bg-transparent text-base outline-none text-gray-900 placeholder-gray-400"
          />
          {loading ? (
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              style={{ border: "1.5px solid #ccc" }}
              aria-label="Close"
            >
              Esc
            </button>
          )}
        </form>

        {/* Results */}
        <div className="max-h-[62vh] overflow-y-auto p-3">
          {/* Products */}
          {results && results.products.length > 0 && (
            <ResultGroup label="Products" accent="#E8001C">
              {results.products.map((product) => (
                <Link
                  key={product.id ?? product.slug}
                  href={ROUTES.PRODUCT(product.slug)}
                  onClick={handleClose}
                  className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-yellow-50"
                >
                  {product.images?.[0] ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded"
                      style={{ border: "1.5px solid #0D0D0D" }}>
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100"
                      style={{ border: "1.5px solid #0D0D0D" }}>
                      <BoxIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">₹{product.salePrice.toLocaleString("en-IN")}</div>
                  </div>
                  <ArrowIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                </Link>
              ))}
              <Link
                href={`${ROUTES.SEARCH}?q=${encodeURIComponent(query)}`}
                onClick={handleClose}
                className="flex items-center justify-center rounded-md px-3 py-2 text-xs font-bold transition-colors hover:bg-yellow-100"
                style={{ color: "#E8001C" }}
              >
                See all results for &ldquo;{query}&rdquo; →
              </Link>
            </ResultGroup>
          )}

          {/* Franchises */}
          {results && results.franchises.length > 0 && (
            <ResultGroup label="Franchises" accent="#0057FF">
              {results.franchises.map((f) => (
                <Link
                  key={f.slug}
                  href={ROUTES.FRANCHISE(f.slug)}
                  onClick={handleClose}
                  className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-yellow-50"
                >
                  {f.thumbnailImage ? (
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded"
                      style={{ border: "1.5px solid #0D0D0D" }}>
                      <Image src={f.thumbnailImage} alt={f.name} fill sizes="36px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gray-100"
                      style={{ border: "1.5px solid #0D0D0D" }}>
                      <span className="text-lg">🎬</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900">{f.name}</div>
                  </div>
                  <ArrowIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                </Link>
              ))}
            </ResultGroup>
          )}

          {/* Brands */}
          {results && results.brands.length > 0 && (
            <ResultGroup label="Brands" accent="#6B21A8">
              {results.brands.map((b) => (
                <Link
                  key={b.slug}
                  href={ROUTES.BRAND(b.slug)}
                  onClick={handleClose}
                  className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-yellow-50"
                >
                  {b.logoImage ? (
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded"
                      style={{ border: "1.5px solid #0D0D0D" }}>
                      <Image src={b.logoImage} alt={b.name} fill sizes="36px" className="object-contain p-1" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gray-100"
                      style={{ border: "1.5px solid #0D0D0D" }}>
                      <span className="text-lg">🏭</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900">{b.name}</div>
                  </div>
                  <ArrowIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                </Link>
              ))}
            </ResultGroup>
          )}

          {/* Empty API search */}
          {results && !hasApiResults && query.length >= 2 && (
            <p className="px-3 py-4 text-center text-sm text-gray-500">
              No results for &ldquo;<strong>{query}</strong>&rdquo;. Try a different keyword.
            </p>
          )}

          {/* Quick links (always shown) */}
          {matchedLinks.length > 0 && (
            <ResultGroup label="Quick Links" accent="#0D0D0D">
              <div className="grid grid-cols-2 gap-1">
                {matchedLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={handleClose}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-yellow-100"
                  >
                    <ArrowIcon className="h-3 w-3 text-gray-400" />
                    {l.label}
                  </Link>
                ))}
              </div>
            </ResultGroup>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
