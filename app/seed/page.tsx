"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";
import { Button } from "@/components/ui/Button";
import {
  SEED_PRODUCTS,
  SEED_COLLECTIONS,
  SEED_FRANCHISES,
  SEED_BRANDS,
  SEED_CURATED_COLLECTIONS,
  SEED_BANNERS,
  SEED_PROMO_BANNERS,
  SEED_HOME_SECTIONS,
  SEED_ANNOUNCEMENTS,
  SEED_TESTIMONIALS,
  SEED_FAQ,
  SEED_DISCOUNTS,
  SEED_ORDER_STATUS_CONFIG,
  SEED_PAGES,
  SEED_BLOG_POSTS,
} from "@/scripts/seed-data";
import { cn } from "@/lib/cn";

// â”€â”€â”€ Entity definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ENTITY_GROUPS = [
  {
    label: "Site",
    entities: [
      { key: "siteConfig", label: "Site Config", seedCount: 1, canDelete: false },
      { key: "loyaltyConfig", label: "Loyalty Config", seedCount: 1, canDelete: false },
      { key: "orderStatusConfig", label: "Order Status Config", seedCount: SEED_ORDER_STATUS_CONFIG.length, canDelete: true },
    ],
  },
  {
    label: "Taxonomy",
    entities: [
      { key: "franchises", label: "Franchises", seedCount: SEED_FRANCHISES.length, canDelete: true },
      { key: "brands", label: "Brands", seedCount: SEED_BRANDS.length, canDelete: true },
      { key: "curatedCollections", label: "Curated Collections", seedCount: SEED_CURATED_COLLECTIONS.length, canDelete: true },
    ],
  },
  {
    label: "Products & Collections",
    entities: [
      { key: "products", label: "Products", seedCount: SEED_PRODUCTS.length, canDelete: true },
      { key: "collections", label: "Collections", seedCount: SEED_COLLECTIONS.length, canDelete: true },
    ],
  },
  {
    label: "Storefront Content",
    entities: [
      { key: "banners", label: "Hero Banners", seedCount: SEED_BANNERS.length, canDelete: true },
      { key: "promobanners", label: "Promo Banners", seedCount: SEED_PROMO_BANNERS.length, canDelete: true },
      { key: "homeSections", label: "Home Sections", seedCount: SEED_HOME_SECTIONS.length, canDelete: true },
      { key: "announcements", label: "Announcements", seedCount: SEED_ANNOUNCEMENTS.length, canDelete: true },
    ],
  },
  {
    label: "Social & Engagement",
    entities: [
      { key: "testimonials", label: "Testimonials", seedCount: SEED_TESTIMONIALS.length, canDelete: true },
      { key: "faq", label: "FAQ Items", seedCount: SEED_FAQ.length, canDelete: true },
    ],
  },
  {
    label: "Commerce",
    entities: [
      { key: "discounts", label: "Discount Codes", seedCount: SEED_DISCOUNTS.length, canDelete: true },
    ],
  },
  {
    label: "Settings",
    entities: [
      { key: "paymentSettings", label: "Payment Settings", seedCount: 1, canDelete: false },
      { key: "shippingSettings", label: "Shipping Settings", seedCount: 1, canDelete: false },
      { key: "navigationConfig", label: "Navigation Config", seedCount: 1, canDelete: false },
    ],
  },
  {
    label: "Content Pages & Blog",
    entities: [
      { key: "pages", label: "Content Pages", seedCount: SEED_PAGES.length, canDelete: true },
      { key: "blogPosts", label: "Blog Posts", seedCount: SEED_BLOG_POSTS.length, canDelete: true },
    ],
  },
];

const ALL_ENTITY_META = ENTITY_GROUPS.flatMap((g) => g.entities);

type ResultStatus = "idle" | "loading" | "ok" | "error" | "partial";

async function getIdToken(): Promise<string | null> {
  const user = getAuth(getFirebaseApp()).currentUser;
  return user ? user.getIdToken() : null;
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function SeedPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ResultStatus>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  const fetchCounts = useCallback(async () => {
    setCountsLoading(true);
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch("/api/admin/seed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { counts: Record<string, number> };
      setDbCounts(data.counts ?? {});
    } finally {
      setCountsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelected(new Set(ALL_ENTITY_META.map((e) => e.key)));
    } else {
      setSelected(new Set());
    }
  }

  function toggleEntity(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function selectEmpty() {
    const emptyKeys = ALL_ENTITY_META
      .filter((e) => (dbCounts[e.key] ?? -1) === 0)
      .map((e) => e.key);
    setSelected(new Set(emptyKeys));
  }

  async function run(action: "seed" | "delete", entityKeys?: string[]) {
    const entitiesToRun = entityKeys ?? [...selected];
    if (entitiesToRun.length === 0) return;

    if (action === "delete") {
      // Use a non-blocking confirmation pattern instead of window.confirm
      const confirmed = window.confirm(
        `Delete seed data for: ${entitiesToRun.join(", ")}?\n\nThis cannot be undone.`,
      );
      if (!confirmed) return;
    }

    setStatus("loading");
    setResults({});
    setLog([`â–¶ ${action === "seed" ? "Seeding" : "Deleting"}: ${entitiesToRun.join(", ")}â€¦`]);

    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, entities: entitiesToRun }),
      });

      const data = (await res.json()) as { results: Record<string, string> };
      setResults(data.results ?? {});

      const newLog: string[] = [];
      let hasError = false;

      for (const [entity, result] of Object.entries(data.results ?? {})) {
        if (result === "ok") {
          newLog.push(`  âœ… ${entity}`);
        } else {
          newLog.push(`  âŒ ${entity}: ${result}`);
          hasError = true;
        }
      }

      if (hasError) {
        newLog.push("âš ï¸  Completed with some errors.");
        setStatus("partial");
      } else {
        newLog.push("âœ”  All done.");
        setStatus("ok");
      }

      setLog((l) => [...l, ...newLog]);
      // Refresh live counts after any write
      await fetchCounts();
    } catch (err) {
      setLog((l) => [
        ...l,
        `âŒ Network error: ${err instanceof Error ? err.message : String(err)}`,
      ]);
      setStatus("error");
    }
  }

  const allKeys = ALL_ENTITY_META.map((e) => e.key);
  const allSelected = selected.size === allKeys.length;
  const someSelected = selected.size > 0 && !allSelected;
  const anyDeleteSupported = [...selected].some(
    (key) => ALL_ENTITY_META.find((e) => e.key === key)?.canDelete,
  );
  const emptyCount = ALL_ENTITY_META.filter((e) => (dbCounts[e.key] ?? -1) === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Seed Data</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upsert or delete Hobson Collectibles seed data in Firestore. All records use
            fixed IDs â€” seeding is idempotent and safe to run multiple times.
          </p>
        </div>
        <button
          onClick={fetchCounts}
          disabled={countsLoading}
          className="shrink-0 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {countsLoading ? "Refreshingâ€¦" : "â†» Refresh Status"}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
        <input
          type="checkbox"
          id="select-all"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected;
          }}
          onChange={(e) => toggleAll(e.target.checked)}
          className="h-4 w-4 accent-red-600"
        />
        <label htmlFor="select-all" className="text-sm font-medium text-gray-700 cursor-pointer">
          Select all
        </label>
        <span className="text-xs text-gray-400">
          {selected.size} / {allKeys.length} selected
        </span>
        {emptyCount > 0 && (
          <button
            onClick={selectEmpty}
            className="ml-auto rounded-md bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
          >
            Select empty ({emptyCount})
          </button>
        )}
      </div>

      {/* Entity groups */}
      <div className="space-y-4">
        {ENTITY_GROUPS.map((group) => (
          <div key={group.label} className="rounded-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {group.label}
            </div>
            <ul className="divide-y divide-gray-100">
              {group.entities.map((entity) => {
                const checked = selected.has(entity.key);
                const result = results[entity.key];
                const liveCount = dbCounts[entity.key];
                const hasLiveCount = liveCount !== undefined;
                const isEmpty = hasLiveCount && liveCount === 0;
                return (
                  <li
                    key={entity.key}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors",
                      checked ? "bg-red-50" : "bg-white hover:bg-gray-50",
                    )}
                  >
                    <input
                      type="checkbox"
                      id={`entity-${entity.key}`}
                      checked={checked}
                      onChange={() => toggleEntity(entity.key)}
                      className="h-4 w-4 accent-red-600"
                    />
                    <label
                      htmlFor={`entity-${entity.key}`}
                      className="flex-1 cursor-pointer text-sm font-medium text-gray-800"
                    >
                      {entity.label}
                    </label>
                    <span className="text-xs text-gray-400">
                      {entity.seedCount === 1 ? "singleton" : `${entity.seedCount} records`}
                    </span>
                    {/* Live DB count badge */}
                    {hasLiveCount && (
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          isEmpty
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-green-50 text-green-700 border border-green-200",
                        )}
                      >
                        {isEmpty ? "empty" : `${liveCount} in DB`}
                      </span>
                    )}
                    {/* Op result badge */}
                    {result && (
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          result === "ok"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700",
                        )}
                      >
                        {result === "ok" ? "âœ“" : "âœ—"}
                      </span>
                    )}
                    {!entity.canDelete && (
                      <span className="text-xs text-gray-300 italic">no-delete</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={() => run("seed")}
          disabled={selected.size === 0 || status === "loading"}
          loading={status === "loading"}
        >
          â†‘ Seed Selected
        </Button>
        {emptyCount > 0 && (
          <Button
            variant="secondary"
            onClick={() => run("seed", ALL_ENTITY_META.filter((e) => dbCounts[e.key] === 0).map((e) => e.key))}
            disabled={status === "loading"}
            loading={status === "loading"}
          >
            â†‘ Seed Empty Only
          </Button>
        )}
        <Button
          variant="danger"
          onClick={() => run("delete")}
          disabled={selected.size === 0 || !anyDeleteSupported || status === "loading"}
          loading={status === "loading"}
        >
          âœ• Delete Selected
        </Button>
        {status !== "idle" && status !== "loading" && (
          <button
            onClick={() => {
              setStatus("idle");
              setResults({});
              setLog([]);
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear results
          </button>
        )}
      </div>

      {/* Status banner */}
      {status === "ok" && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium flex items-center justify-between gap-4">
          <span>âœ… Operation completed successfully. Caches revalidated.</span>
          <a
            href="/"
            className="shrink-0 rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
          >
            View Storefront â†’
          </a>
        </div>
      )}
      {status === "error" && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
          âŒ Operation failed. See log below.
        </div>
      )}
      {status === "partial" && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 font-medium">
          âš ï¸ Completed with some errors. See log below.
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div
          ref={logRef}
          className="max-h-56 overflow-y-auto rounded-md bg-gray-900 p-4 font-mono text-xs text-gray-200 space-y-0.5"
        >
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">Notes</p>
        <ul className="list-disc list-inside space-y-1">
          <li>All seed records use fixed IDs â€” seeding is safe to re-run at any time.</li>
          <li>Singleton entities (siteConfig, paymentSettings, etc.) do not support delete via this page.</li>
          <li>Product images use Unsplash URLs â€” replace with real CDN URLs in production.</li>
          <li>Deleting collections will not cascade-delete products in those collections.</li>
        </ul>
      </div>
    </div>
  );
}
