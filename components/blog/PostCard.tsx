import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { BlogPost } from "@/types/content";

interface PostCardProps {
  post: BlogPost;
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

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={ROUTES.BLOG_POST(post.slug)}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {post.coverImage && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h2 className="line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-red-600">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="line-clamp-3 text-sm text-gray-500">{post.excerpt}</p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-gray-400">
          {post.authorAvatar && (
            <Image
              src={post.authorAvatar}
              alt={post.authorName}
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
          <span>{post.authorName}</span>
          <span>·</span>
          <time dateTime={formatDate(post.publishedAt)}>
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </div>
    </Link>
  );
}
