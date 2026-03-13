import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPostServer, getAllBlogPostsServer } from "@/lib/firebase/server";
import { PostBody } from "@/components/blog/PostBody";
import { generateBlogMetadata } from "@/lib/seo";
import { ROUTES } from "@/constants/routes";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllBlogPostsServer().catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostServer(slug).catch(() => null);
  if (!post) return { title: "Post not found" };
  return generateBlogMetadata(post);
}

function formatDate(ts: { toDate?: () => Date } | Date | string): string {
  let date: Date;
  if (ts && typeof (ts as { toDate?: () => Date }).toDate === "function") {
    date = (ts as { toDate: () => Date }).toDate();
  } else if (ts instanceof Date) {
    date = ts;
  } else {
    date = new Date(ts as string);
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostServer(slug).catch(() => null);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back link */}
      <Link
        href={ROUTES.BLOG}
        className="mb-6 inline-flex items-center gap-1 text-sm font-bold"
        style={{ color: "#E8001C" }}
      >
        ← Blog
      </Link>

      {/* Cover image */}
      {post.coverImage && (
        <div
          className="relative mb-8 aspect-[16/9] w-full overflow-hidden"
          style={{ border: "3px solid #0D0D0D", boxShadow: "4px 4px 0px #0D0D0D" }}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-black uppercase"
              style={{
                background: "#FFE500",
                border: "2px solid #0D0D0D",
                color: "#0D0D0D",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1
        className="mb-3"
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "clamp(2rem, 5vw, 2.8rem)",
          letterSpacing: "0.06em",
          color: "var(--color-black)",
        }}
      >
        {post.title.toUpperCase()}
      </h1>

      {/* Author + date */}
      <div className="mb-8 flex items-center gap-3 text-sm" style={{ color: "var(--text-muted-strong)" }}>
        {post.authorAvatar && (
          <Image
            src={post.authorAvatar}
            alt={post.authorName}
            width={28}
            height={28}
            className="rounded-full"
          />
        )}
        <span className="font-bold" style={{ color: "var(--color-black)" }}>{post.authorName}</span>
        <span>·</span>
        <time dateTime={formatDate(post.publishedAt)}>
          {formatDate(post.publishedAt)}
        </time>
      </div>

      {/* Body */}
      <PostBody html={post.body} />
    </div>
  );
}
