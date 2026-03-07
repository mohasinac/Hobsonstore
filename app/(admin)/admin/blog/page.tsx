"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBlogPostsAdmin, deleteBlogPost } from "@/lib/firebase/content";
import { Button } from "@/components/ui/Button";
import type { BlogPost } from "@/types/content";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBlogPostsAdmin().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await deleteBlogPost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Blog Posts</h1>
        <Link href="/admin/blog/new">
          <Button size="sm">+ New Post</Button>
        </Link>
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Slug</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{p.title}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{p.slug}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/blog/${p.id}`} className="text-xs text-red-600 hover:underline mr-2">Edit</Link>
                    <button onClick={() => handleDelete(p.id, p.title)} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No posts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
