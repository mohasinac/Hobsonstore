"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";
import { getUser } from "@/lib/firebase/users";
import {
  SEED_PRODUCTS,
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
  SEED_ADMIN_USER,
} from "@/scripts/seed-data";
import { cn } from "@/lib/cn";

// ─── Entity definitions ───────────────────────────────────────────────────────

const GROUP_ICONS: Record<string, string> = {
  "Admin": "👤",
  "Site": "⚙️",
  "Taxonomy": "🗂️",
  "Products & Collections": "📦",
  "Storefront Content": "🖼️",
  "Social & Engagement": "💬",
  "Commerce": "🏷️",
  "Settings": "🔧",
  "Content Pages & Blog": "📝",
};

const ENTITY_GROUPS = [
  {
    label: "Admin",
    color: "#A855F7",
    entities: [
      { key: "adminUser", label: "Admin User", seedCount: 1, canDelete: true },
    ],
  },
  {
    label: "Site",
    color: "#6366F1",
    entities: [
      { key: "siteConfig", label: "Site Config", seedCount: 1, canDelete: false },
      { key: "loyaltyConfig", label: "Loyalty Config", seedCount: 1, canDelete: false },
      { key: "orderStatusConfig", label: "Order Status Config", seedCount: SEED_ORDER_STATUS_CONFIG.length, canDelete: true },
    ],
  },
  {
    label: "Taxonomy",
    color: "#F59E0B",
    entities: [
      { key: "franchises", label: "Franchises", seedCount: SEED_FRANCHISES.length, canDelete: true },
      { key: "brands", label: "Brands", seedCount: SEED_BRANDS.length, canDelete: true },
      { key: "curatedCollections", label: "Curated Collections", seedCount: SEED_CURATED_COLLECTIONS.length, canDelete: true },
    ],
  },
  {
    label: "Products & Collections",
    color: "#E8001C",
    entities: [
      { key: "products", label: "Products", seedCount: SEED_PRODUCTS.length, canDelete: true },
    ],
  },
  {
    label: "Storefront Content",
    color: "#10B981",
    entities: [
      { key: "banners", label: "Hero Banners", seedCount: SEED_BANNERS.length, canDelete: true },
      { key: "promobanners", label: "Promo Banners", seedCount: SEED_PROMO_BANNERS.length, canDelete: true },
      { key: "homeSections", label: "Home Sections", seedCount: SEED_HOME_SECTIONS.length, canDelete: true },
      { key: "announcements", label: "Announcements", seedCount: SEED_ANNOUNCEMENTS.length, canDelete: true },
    ],
  },
  {
    label: "Social & Engagement",
    color: "#EC4899",
    entities: [
      { key: "testimonials", label: "Testimonials", seedCount: SEED_TESTIMONIALS.length, canDelete: true },
      { key: "faq", label: "FAQ Items", seedCount: SEED_FAQ.length, canDelete: true },
    ],
  },
  {
    label: "Commerce",
    color: "#FFE500",
    entities: [
      { key: "discounts", label: "Discount Codes", seedCount: SEED_DISCOUNTS.length, canDelete: true },
    ],
  },
  {
    label: "Settings",
    color: "#94A3B8",
    entities: [
      { key: "paymentSettings", label: "Payment Settings", seedCount: 1, canDelete: false },
      { key: "shippingSettings", label: "Shipping Settings", seedCount: 1, canDelete: false },
      { key: "navigationConfig", label: "Navigation Config", seedCount: 1, canDelete: false },
    ],
  },
  {
    label: "Content Pages & Blog",
    color: "#38BDF8",
    entities: [
      { key: "pages", label: "Content Pages", seedCount: SEED_PAGES.length, canDelete: true },
      { key: "blogPosts", label: "Blog Posts", seedCount: SEED_BLOG_POSTS.length, canDelete: true },
    ],
  },
];

const ALL_ENTITY_META = ENTITY_GROUPS.flatMap((g) => g.entities);

type ResultStatus = "idle" | "loading" | "ok" | "error" | "partial";

// ─── Auth gate ───────────────────────────────────────────────────────────────

export default function SeedPage() {
  const router = useRouter();
  const isDev = process.env.NODE_ENV === "development";
  const [allowed, setAllowed] = useState(isDev);

  useEffect(() => {
    if (isDev) return; // dev: skip auth check entirely
    const auth = getAuth(getFirebaseApp());
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/login");
        return;
      }
      const profile = await getUser(firebaseUser.uid);
      if (profile?.role !== "admin") {
        router.replace("/");
        return;
      }
      setAllowed(true);
    });
    return unsubscribe;
  }, [isDev, router]);

  if (!allowed) {
    return (
      <div style={{ background: "#0A0A0A", minHeight: "100vh" }} className="flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking access…</p>
      </div>
    );
  }

  return <SeedPageContent />;
}

// ─── Main page ────────────────────────────────────────────────────────────────

function SeedPageContent() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ResultStatus>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  const fetchCounts = useCallback(async () => {
    setCountsLoading(true);
    try {
      const res = await fetch("/api/admin/seed");
      if (!res.ok) return;
      const data = (await res.json()) as { counts: Record<string, number> };
      setDbCounts(data.counts ?? {});
    } finally {
      setCountsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(ALL_ENTITY_META.map((e) => e.key)) : new Set());
  }

  function toggleEntity(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function selectEmpty() {
    setSelected(new Set(ALL_ENTITY_META.filter((e) => (dbCounts[e.key] ?? -1) === 0).map((e) => e.key)));
  }

  async function run(action: "seed" | "delete", entityKeys?: string[]) {
    const entitiesToRun = entityKeys ?? [...selected];
    if (entitiesToRun.length === 0) return;
    if (action === "delete") {
      if (!window.confirm(`Delete seed data for: ${entitiesToRun.join(", ")}?\n\nThis cannot be undone.`)) return;
    }
    setStatus("loading");
    setResults({});
    setLog([`▶ ${action === "seed" ? "Seeding" : "Deleting"}: ${entitiesToRun.join(", ")}…`]);
    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, entities: entitiesToRun }),
      });
      const data = (await res.json()) as { results: Record<string, string> };
      setResults(data.results ?? {});
      const newLog: string[] = [];
      let hasError = false;
      for (const [entity, result] of Object.entries(data.results ?? {})) {
        if (result === "ok") newLog.push(`  ✅ ${entity}`);
        else { newLog.push(`  ❌ ${entity}: ${result}`); hasError = true; }
      }
      newLog.push(hasError ? "⚠️  Completed with some errors." : "✔  All done.");
      setStatus(hasError ? "partial" : "ok");
      setLog((l) => [...l, ...newLog]);
      await fetchCounts();
    } catch (err) {
      setLog((l) => [...l, `❌ Network error: ${err instanceof Error ? err.message : String(err)}`]);
      setStatus("error");
    }
  }

  const allKeys = ALL_ENTITY_META.map((e) => e.key);
  const allSelected = selected.size === allKeys.length;
  const someSelected = selected.size > 0 && !allSelected;
  const anyDeleteSupported = [...selected].some((key) => ALL_ENTITY_META.find((e) => e.key === key)?.canDelete);
  const emptyCount = ALL_ENTITY_META.filter((e) => (dbCounts[e.key] ?? -1) === 0).length;
  const seededCount = ALL_ENTITY_META.filter((e) => (dbCounts[e.key] ?? 0) > 0).length;
  const totalEntities = ALL_ENTITY_META.length;

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh" }}>
      {/* ── Hero header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0D0D0D 0%, #1a0a0a 50%, #0D0D0D 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
        className="px-6 py-12"
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-900/50 bg-red-950/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Developer Tool
              </div>
              <h1
                className="text-4xl sm:text-5xl font-black tracking-wider"
                style={{ fontFamily: "var(--font-bangers, Bangers, cursive)", color: "#FFE500", letterSpacing: "0.06em" }}
              >
                SEED DATA
              </h1>
              <p className="mt-2 text-sm text-gray-400 max-w-md">
                Upsert or delete Hobson Collectibles seed data in Firestore. All records use fixed IDs — safe to re-run any time.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 shrink-0">
              <StatPill label="Seeded" value={seededCount} total={totalEntities} color="#10B981" />
              <StatPill label="Empty" value={emptyCount} total={totalEntities} color="#E8001C" />
              <button
                onClick={fetchCounts}
                disabled={countsLoading}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                <span className={countsLoading ? "animate-spin" : ""}>↻</span>
                {countsLoading ? "Syncing…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">

        {/* Toolbar */}
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl px-5 py-3"
          style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <input
            type="checkbox"
            id="select-all"
            checked={allSelected}
            ref={(el) => { if (el) el.indeterminate = someSelected; }}
            onChange={(e) => toggleAll(e.target.checked)}
            className="h-4 w-4 accent-red-600 cursor-pointer"
          />
          <label htmlFor="select-all" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
            Select all
          </label>
          <span className="text-xs text-gray-500">
            {selected.size} / {allKeys.length} selected
          </span>
          {emptyCount > 0 && (
            <button
              onClick={selectEmpty}
              className="ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              style={{ background: "rgba(251,191,36,0.12)", color: "#FCD34D", border: "1px solid rgba(251,191,36,0.25)" }}
            >
              ⚡ Select empty ({emptyCount})
            </button>
          )}
        </div>

        {/* Admin credentials card */}
        <AdminCredentialsCard adminSeeded={(dbCounts["adminUser"] ?? 0) > 0} />

        {/* Entity groups */}
        <div className="grid gap-4 sm:grid-cols-2">
          {ENTITY_GROUPS.map((group) => (
            <EntityGroup
              key={group.label}
              group={group}
              selected={selected}
              results={results}
              dbCounts={dbCounts}
              onToggle={toggleEntity}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl px-5 py-4"
          style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ActionButton
            onClick={() => run("seed")}
            disabled={selected.size === 0 || status === "loading"}
            loading={status === "loading"}
            color="#E8001C"
          >
            ↑ Seed Selected
          </ActionButton>
          {emptyCount > 0 && (
            <ActionButton
              onClick={() => run("seed", ALL_ENTITY_META.filter((e) => dbCounts[e.key] === 0).map((e) => e.key))}
              disabled={status === "loading"}
              loading={status === "loading"}
              color="#10B981"
            >
              ↑ Seed Empty Only
            </ActionButton>
          )}
          <ActionButton
            onClick={() => run("delete")}
            disabled={selected.size === 0 || !anyDeleteSupported || status === "loading"}
            loading={status === "loading"}
            color="#6B7280"
            destructive
          >
            ✕ Delete Selected
          </ActionButton>
          {status !== "idle" && status !== "loading" && (
            <button
              onClick={() => { setStatus("idle"); setResults({}); setLog([]); }}
              className="ml-auto text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 transition"
            >
              Clear results
            </button>
          )}
        </div>

        {/* Status banners */}
        {status === "ok" && (
          <div className="flex items-center justify-between gap-4 rounded-xl px-5 py-4" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <span className="text-sm font-semibold text-emerald-400">✅ Operation completed. Caches revalidated.</span>
            <a href="/" className="shrink-0 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition">
              View Storefront →
            </a>
          </div>
        )}
        {status === "error" && (
          <div className="rounded-xl px-5 py-4" style={{ background: "rgba(232,0,28,0.1)", border: "1px solid rgba(232,0,28,0.25)" }}>
            <span className="text-sm font-semibold text-red-400">❌ Operation failed. See log below.</span>
          </div>
        )}
        {status === "partial" && (
          <div className="rounded-xl px-5 py-4" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
            <span className="text-sm font-semibold text-amber-400">⚠️ Completed with some errors. See log below.</span>
          </div>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div
            ref={logRef}
            className="max-h-56 overflow-y-auto rounded-xl p-5 font-mono text-xs space-y-1"
            style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {log.map((line, i) => (
              <div
                key={i}
                className={cn(
                  line.startsWith("  ✅") && "text-emerald-400",
                  line.startsWith("  ❌") && "text-red-400",
                  line.startsWith("⚠️") && "text-amber-400",
                  line.startsWith("✔") && "text-emerald-300",
                  line.startsWith("▶") && "text-gray-300 font-semibold",
                  !line.match(/^(\s*(✅|❌)|⚠️|✔|▶)/) && "text-gray-500",
                )}
              >
                {line}
              </div>
            ))}
          </div>
        )}

        {/* Update by ID */}
        <UpdateById onRefresh={fetchCounts} />

        {/* Notes */}
        <div className="rounded-xl px-5 py-4 text-xs space-y-1.5" style={{ background: "#0D0D0D", border: "1px solid rgba(56,189,248,0.15)" }}>
          <p className="font-semibold text-sky-400 mb-2">ℹ️ Notes</p>
          <ul className="space-y-1 text-gray-500 list-disc list-inside">
            <li>All seed records use fixed IDs — seeding is idempotent and safe to re-run.</li>
            <li>Singleton entities (siteConfig, paymentSettings, etc.) cannot be deleted via this page.</li>
            <li>Product images use placeholder URLs — replace with real CDN URLs in production.</li>
            <li>Deleting collections will not cascade-delete products in those collections.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── AdminCredentialsCard ─────────────────────────────────────────────────

function AdminCredentialsCard({ adminSeeded }: { adminSeeded: boolean }) {
  const [emailCopied, setEmailCopied] = useState(false);
  const [pwCopied, setPwCopied] = useState(false);

  function copy(text: string, cb: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      cb(true);
      setTimeout(() => cb(false), 2000);
    });
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#0E0414", border: "1px solid rgba(168,85,247,0.3)" }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid rgba(168,85,247,0.18)", borderLeft: "3px solid #A855F7" }}
      >
        <span className="text-base">👤</span>
        <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Seed Admin Credentials</span>
        <span
          className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={
            adminSeeded
              ? { background: "rgba(16,185,129,0.15)", color: "#34D399" }
              : { background: "rgba(232,0,28,0.15)", color: "#F87171" }
          }
        >
          {adminSeeded ? "✓ seeded" : "not seeded"}
        </span>
      </div>
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs text-gray-500">
          Use these credentials to log in as admin after seeding. Seed the{" "}
          <span className="text-purple-400 font-medium">Admin User</span> entity above to create this account.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <CredentialField
            label="Email"
            value={SEED_ADMIN_USER.email}
            copied={emailCopied}
            onCopy={() => copy(SEED_ADMIN_USER.email, setEmailCopied)}
          />
          <CredentialField
            label="Password"
            value={SEED_ADMIN_USER.password}
            copied={pwCopied}
            onCopy={() => copy(SEED_ADMIN_USER.password, setPwCopied)}
            secret
          />
          <CredentialField label="Role" value={SEED_ADMIN_USER.role} />
        </div>
      </div>
    </div>
  );
}

function CredentialField({
  label,
  value,
  copied,
  onCopy,
  secret = false,
}: {
  label: string;
  value: string;
  copied?: boolean;
  onCopy?: () => void;
  secret?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">{label}</span>
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2"
        style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="flex-1 font-mono text-xs text-gray-200 truncate select-all">
          {secret && !revealed ? "•".repeat(value.length) : value}
        </span>
        {secret && (
          <button
            onClick={() => setRevealed((r) => !r)}
            className="text-[10px] text-gray-600 hover:text-gray-400 transition shrink-0"
            title={revealed ? "Hide" : "Show"}
          >
            {revealed ? "🛅" : "👁️"}
          </button>
        )}
        {onCopy && (
          <button
            onClick={onCopy}
            className="text-[10px] font-semibold shrink-0 transition"
            style={{ color: copied ? "#34D399" : "#A855F7" }}
            title="Copy"
          >
            {copied ? "✓" : "📋"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className="text-2xl font-black" style={{ color }}>{value}</span>
      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / total) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

type GroupShape = {
  label: string;
  color: string;
  entities: { key: string; label: string; seedCount: number; canDelete: boolean }[];
};

function EntityGroup({
  group,
  selected,
  results,
  dbCounts,
  onToggle,
}: {
  group: GroupShape;
  selected: Set<string>;
  results: Record<string, string>;
  dbCounts: Record<string, number>;
  onToggle: (key: string) => void;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Group header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ borderBottom: `1px solid rgba(255,255,255,0.06)`, borderLeft: `3px solid ${group.color}` }}
      >
        <span className="text-base">{GROUP_ICONS[group.label] ?? "🔹"}</span>
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: group.color }}
        >
          {group.label}
        </span>
        <span className="ml-auto text-[10px] text-gray-600">{group.entities.length} entity</span>
      </div>

      {/* Entities */}
      <ul className="divide-y divide-white/[0.04]">
        {group.entities.map((entity) => {
          const checked = selected.has(entity.key);
          const result = results[entity.key];
          const liveCount = dbCounts[entity.key];
          const hasLiveCount = liveCount !== undefined;
          const isEmpty = hasLiveCount && liveCount === 0;
          const fillPct = hasLiveCount && entity.seedCount > 1
            ? Math.min(100, Math.round((liveCount / entity.seedCount) * 100))
            : null;

          return (
            <li
              key={entity.key}
              onClick={() => onToggle(entity.key)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
              style={{ background: checked ? `${group.color}10` : "transparent" }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(entity.key)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 shrink-0 cursor-pointer"
                style={{ accentColor: group.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{entity.label}</p>
                {fillPct !== null && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${fillPct}%`, background: isEmpty ? "#E8001C" : group.color }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-600 shrink-0">{fillPct}%</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-gray-600">
                  {entity.seedCount === 1 ? "singleton" : `${entity.seedCount}`}
                </span>
                {hasLiveCount && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                    style={
                      isEmpty
                        ? { background: "rgba(232,0,28,0.15)", color: "#F87171" }
                        : { background: "rgba(16,185,129,0.15)", color: "#34D399" }
                    }
                  >
                    {isEmpty ? "empty" : `${liveCount}`}
                  </span>
                )}
                {result && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                    style={
                      result === "ok"
                        ? { background: "rgba(16,185,129,0.2)", color: "#34D399" }
                        : { background: "rgba(232,0,28,0.2)", color: "#F87171" }
                    }
                  >
                    {result === "ok" ? "✓ done" : "✗ err"}
                  </span>
                )}
                {!entity.canDelete && (
                  <span className="text-[10px] text-gray-700">protected</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  loading,
  color,
  destructive = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  color: string;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: disabled ? "rgba(255,255,255,0.05)" : destructive ? "rgba(107,114,128,0.15)" : `${color}22`,
        color: disabled ? "#4B5563" : destructive ? "#9CA3AF" : color,
        border: `1px solid ${disabled ? "rgba(255,255,255,0.06)" : `${color}44`}`,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = `${color}33`;
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = destructive ? "rgba(107,114,128,0.15)" : `${color}22`;
      }}
    >
      {loading && (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}

// ─── Update-by-ID panel ───────────────────────────────────────────────────────

const ALL_ENTITY_KEYS = [
  "products", "franchises", "brands", "curatedCollections", "collections",
  "banners", "promobanners", "homeSections", "announcements", "testimonials",
  "faq", "discounts", "orderStatusConfig", "pages", "blogPosts",
  "siteConfig", "loyaltyConfig", "paymentSettings", "shippingSettings", "navigationConfig",
];

function UpdateById({ onRefresh }: { onRefresh: () => void }) {
  const [entityKey, setEntityKey] = useState("products");
  const [docId, setDocId] = useState("");
  const [patchText, setPatchText] = useState('{\n  \n}');
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleUpdate() {
    if (!docId.trim()) { setMessage("Document ID is required."); setStatus("error"); return; }
    let patch: Record<string, unknown>;
    try {
      patch = JSON.parse(patchText);
    } catch {
      setMessage("Invalid JSON in patch body."); setStatus("error"); return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/seed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityKey, id: docId.trim(), patch }),
      });
      if (res.ok) {
        setStatus("ok");
        setMessage(`Updated '${docId.trim()}' in ${entityKey}.`);
        onRefresh();
      } else {
        const data = (await res.json()) as { error?: string };
        setStatus("error");
        setMessage(data.error ?? `HTTP ${res.status}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid #6366F1" }}
      >
        <span className="text-base">✏️</span>
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Update Document by ID</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</label>
            <select
              value={entityKey}
              onChange={(e) => setEntityKey(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {ALL_ENTITY_KEYS.map((k) => (
                <option key={k} value={k} style={{ background: "#0D0D0D" }}>{k}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Document ID</label>
            <input
              type="text"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="e.g. hot-toys or ht-batman-001"
              className="rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">JSON Patch — fields to merge</label>
          <textarea
            value={patchText}
            onChange={(e) => setPatchText(e.target.value)}
            rows={6}
            spellCheck={false}
            className="rounded-lg px-3 py-2 font-mono text-xs text-gray-300 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
        <div className="flex items-center gap-4">
          <ActionButton
            onClick={handleUpdate}
            disabled={status === "loading"}
            loading={status === "loading"}
            color="#6366F1"
          >
            Merge Patch
          </ActionButton>
          {status === "ok" && <span className="text-xs text-emerald-400 font-medium">✅ {message}</span>}
          {status === "error" && <span className="text-xs text-red-400 font-medium">❌ {message}</span>}
        </div>
      </div>
    </div>
  );
}
