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
        className="mb-8"
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          letterSpacing: "0.08em",
          color: "#0D0D0D",
        }}
      >
        BLOG
      </h1>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p
            className="text-xl"
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              letterSpacing: "0.06em",
              color: "#0D0D0D",
            }}
          >
            THIS BLOG IS EMPTY.
          </p>
          <p className="mt-2" style={{ color: "#6B6B6B" }}>
            Check back soon — stories are coming.
          </p>
          <Link
            href="/collections"
            className="mt-6 inline-block px-5 py-2.5 text-sm font-black uppercase"
            style={{
              background: "#E8001C",
              color: "#FFFFFF",
              border: "2px solid #0D0D0D",
              boxShadow: "3px 3px 0px #0D0D0D",
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
