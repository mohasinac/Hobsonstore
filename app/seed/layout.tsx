import { notFound } from "next/navigation";

export default function SeedLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-300">
            DEV ONLY
          </span>
          <span className="text-xs text-gray-400">This page does not exist in production.</span>
        </div>
        {children}
      </div>
    </div>
  );
}
