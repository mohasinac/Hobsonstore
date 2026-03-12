import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPostsServer } from "@/lib/firebase/server";
import { PostCard } from "@/components/blog/PostCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "News, reviews and stories from the world of collectibles at Hobson Collectibles.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPostsServer().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1
        className="font-comic mb-8"
        style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "var(--section-title-color)",
        }}
      >
        BLOG
      </h1>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p
            className="font-comic text-xl"
            style={{ color: "var(--section-title-color)" }}
          >
            THIS BLOG IS EMPTY.
          </p>
          <p className="mt-2" style={{ color: "var(--color-muted)" }}>
            Check back soon — stories are coming.
          </p>
          <Link
            href="/collections"
            className="mt-6 inline-block px-5 py-2.5 text-sm font-black uppercase"
            style={{
              background: "var(--color-red)",
              color: "var(--color-white)",
              border: "var(--card-border)",
              boxShadow: "var(--card-shadow)",
              letterSpacing: "0.06em",
            }}
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
