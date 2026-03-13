import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--color-surface)" }}
    >
      <Link
        href="/"
        className="mb-8 text-2xl font-bold text-indigo-700 tracking-tight"
      >
        Hobson
      </Link>
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--table-row-border)",
          boxShadow: "var(--menu-shadow)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
