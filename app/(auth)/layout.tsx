import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-2xl font-bold text-indigo-700 tracking-tight"
      >
        Hobson
      </Link>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        {children}
      </div>
    </div>
  );
}
