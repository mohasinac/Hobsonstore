"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  SEED_PRODUCTS,
  SEED_COLLECTIONS,
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

// ─── Entity definitions ───────────────────────────────────────────────────────

const ENTITY_GROUPS = [
  {
    label: "Site",
    entities: [
      { key: "siteConfig", label: "Site Config", count: 1, canDelete: false },
      { key: "loyaltyConfig", label: "Loyalty Config", count: 1, canDelete: false },
      { key: "orderStatusConfig", label: "Order Status Config", count: SEED_ORDER_STATUS_CONFIG.length, canDelete: true },
    ],
  },
  {
    label: "Products & Collections",
    entities: [
      { key: "products", label: "Products", count: SEED_PRODUCTS.length, canDelete: true },
      { key: "collections", label: "Collections", count: SEED_COLLECTIONS.length, canDelete: true },
    ],
  },
  {
    label: "Storefront Content",
    entities: [
      { key: "banners", label: "Hero Banners", count: SEED_BANNERS.length, canDelete: true },
      { key: "promobanners", label: "Promo Banners", count: SEED_PROMO_BANNERS.length, canDelete: true },
      { key: "homeSections", label: "Home Sections", count: SEED_HOME_SECTIONS.length, canDelete: true },
      { key: "announcements", label: "Announcements", count: SEED_ANNOUNCEMENTS.length, canDelete: true },
    ],
  },
  {
    label: "Social & Engagement",
    entities: [
      { key: "testimonials", label: "Testimonials", count: SEED_TESTIMONIALS.length, canDelete: true },
      { key: "faq", label: "FAQ Items", count: SEED_FAQ.length, canDelete: true },
    ],
  },
  {
    label: "Commerce",
    entities: [
      { key: "discounts", label: "Discount Codes", count: SEED_DISCOUNTS.length, canDelete: true },
    ],
  },
  {
    label: "Content Pages & Blog",
    entities: [
      { key: "pages", label: "Content Pages", count: SEED_PAGES.length, canDelete: true },
      { key: "blogPosts", label: "Blog Posts", count: SEED_BLOG_POSTS.length, canDelete: true },
    ],
  },
];

type ResultStatus = "idle" | "loading" | "ok" | "error" | "partial";

// ─── Component ────────────────────────────────────────────────────────────────

export default function SeedPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ResultStatus>("idle");
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  function toggleAll(checked: boolean) {
    if (checked) {
      const all = ENTITY_GROUPS.flatMap((g) => g.entities.map((e) => e.key));
      setSelected(new Set(all));
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

  async function run(action: "seed" | "delete") {
    if (selected.size === 0) return;

    if (action === "delete") {
      const ok = window.confirm(
        `Delete all seed data for: ${[...selected].join(", ")}?\n\nThis cannot be undone.`,
      );
      if (!ok) return;
    }

    setStatus("loading");
    setResults({});
    setLog([`▶ ${action === "seed" ? "Seeding" : "Deleting"}: ${[...selected].join(", ")}…`]);

    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, entities: [...selected] }),
      });

      const data = (await res.json()) as { results: Record<string, string> };
      setResults(data.results ?? {});

      const newLog: string[] = [];
      let hasError = false;

      for (const [entity, result] of Object.entries(data.results ?? {})) {
        if (result === "ok") {
          newLog.push(`  ✅ ${entity}`);
        } else {
          newLog.push(`  ❌ ${entity}: ${result}`);
          hasError = true;
        }
      }

      if (hasError) {
        newLog.push("⚠️  Completed with some errors.");
        setStatus("partial");
      } else {
        newLog.push(`✔  All done.`);
        setStatus("ok");
        // Revalidation is handled server-side by the seed API (revalidatePath).
        // Do NOT call router.refresh() here — it causes a cascade of GET /seed requests.
      }

      setLog((l) => [...l, ...newLog]);
    } catch (err) {
      setLog((l) => [...l, `❌ Network error: ${err instanceof Error ? err.message : String(err)}`]);
      setStatus("error");
    }
  }

  const allKeys = ENTITY_GROUPS.flatMap((g) => g.entities.map((e) => e.key));
  const allSelected = selected.size === allKeys.length;
  const someSelected = selected.size > 0 && !allSelected;
  const anyDeleteSupported = [...selected].some(
    (key) => ENTITY_GROUPS.flatMap((g) => g.entities).find((e) => e.key === key)?.canDelete,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Seed Data</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upsert or delete Hobson Collectibles seed data in Firestore. All records use
          fixed IDs — seeding is idempotent and safe to run multiple times.
        </p>
      </div>

      {/* Select all */}
      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
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
          Select all entities
        </label>
        <span className="ml-auto text-xs text-gray-400">
          {selected.size} / {allKeys.length} selected
        </span>
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
                      {entity.count === 1 ? "singleton" : `${entity.count} records`}
                    </span>
                    {result && (
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          result === "ok"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700",
                        )}
                      >
                        {result === "ok" ? "✓" : "✗"}
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
          ↑ Seed Selected
        </Button>
        <Button
          variant="danger"
          onClick={() => run("delete")}
          disabled={selected.size === 0 || !anyDeleteSupported || status === "loading"}
          loading={status === "loading"}
        >
          ✕ Delete Selected
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
          <span>✅ Operation completed successfully. Caches revalidated.</span>
          <a
            href="/"
            className="shrink-0 rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
          >
            View Storefront →
          </a>
        </div>
      )}
      {status === "error" && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
          ❌ Operation failed. See log below.
        </div>
      )}
      {status === "partial" && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 font-medium">
          ⚠️  Completed with some errors. See log below.
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
          <li>All seed records use fixed IDs — seeding is safe to re-run at any time.</li>
          <li><strong>siteConfig</strong> and <strong>loyaltyConfig</strong> are singleton documents (delete not supported via this page).</li>
          <li>Product images use Unsplash URLs — replace with real CDN URLs in production.</li>
          <li>Deleting collections will not cascade-delete products in those collections.</li>
        </ul>
      </div>
    </div>
  );
}
