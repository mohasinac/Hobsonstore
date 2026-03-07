import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/firebase/content";
import { PostCard } from "@/components/blog/PostCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "News, reviews and stories from the world of collectibles at Hobson Collectibles.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Blog</h1>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-xl font-semibold text-gray-700">
            This blog is empty.
          </p>
          <p className="mt-2 text-gray-500">
            Check back soon — stories are coming.
          </p>
          <Link
            href="/collections"
            className="mt-6 inline-block rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Browse Collectibles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
