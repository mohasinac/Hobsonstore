import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-extrabold text-indigo-700">404</h1>
      <p className="mt-4 text-xl font-semibold text-gray-900">Page not found</p>
      <p className="mt-2 text-gray-500">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-indigo-700 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-800 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
