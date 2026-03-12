import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--section-bg)" }}
    >
      <p
        className="mb-2 text-xs font-black uppercase tracking-[0.3em]"
        style={{ color: "var(--color-red)", fontFamily: "var(--font-bangers, Bangers, cursive)" }}
      >
        Error 404
      </p>
      <h1
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "clamp(5rem, 18vw, 12rem)",
          letterSpacing: "0.05em",
          lineHeight: 1,
          color: "var(--section-title-color)",
          WebkitTextStroke: "3px var(--border-ink)",
        }}
      >
        404
      </h1>
      <p
        className="mt-1 font-black uppercase"
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
          letterSpacing: "0.08em",
          color: "var(--section-title-color)",
        }}
      >
        Page not found
      </p>
      <p
        className="mt-3 max-w-sm text-sm font-medium"
        style={{ color: "var(--color-muted)" }}
      >
        Looks like this collectible escaped its case. Let&apos;s get you back to the collection.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase tracking-widest transition-transform hover:-translate-y-0.5"
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          letterSpacing: "0.1em",
          background: "var(--color-red)",
          color: "#FFFFFF",
          border: "3px solid var(--border-ink)",
          boxShadow: "4px 4px 0px var(--border-ink)",
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
