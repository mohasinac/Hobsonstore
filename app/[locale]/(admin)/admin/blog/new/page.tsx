"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost } from "@/lib/firebase/content";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { serverTimestamp } from "firebase/firestore";
import type { BlogPost } from "@/types/content";

type BlogPostPayload = Omit<BlogPost, "id" | "publishedAt" | "updatedAt">;

export default function NewBlogPostPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<BlogPostPayload>>({ published: false, tags: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof BlogPostPayload>(key: K, value: BlogPostPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title || !form.slug || !form.body) { setError("Title, slug, and body are required."); return; }
    setLoading(true);
    try {
      await createBlogPost({
        title: form.title,
        slug: form.slug,
        coverImage: form.coverImage ?? "",
        body: form.body,
        excerpt: form.excerpt,
        tags: form.tags ?? [],
        authorName: form.authorName ?? "Admin",
        authorAvatar: form.authorAvatar,
        published: form.published ?? false,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        publishedAt: serverTimestamp() as unknown as BlogPost["publishedAt"],
        updatedAt: serverTimestamp() as unknown as BlogPost["updatedAt"],
      });
      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>New Blog Post</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title *" value={form.title ?? ""} onChange={(e) => { set("title", e.target.value); if (!form.slug) set("slug", autoSlug(e.target.value)); }} />
        <Input label="Slug *" value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
        <Input label="Cover Image URL" value={form.coverImage ?? ""} onChange={(e) => set("coverImage", e.target.value)} />
        <Input label="Excerpt" value={form.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} />
        <Input label="Author Name" value={form.authorName ?? ""} onChange={(e) => set("authorName", e.target.value)} />
        <Input label="Tags (comma-separated)" value={(form.tags ?? []).join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
        <ContentEditor label="Body *" value={form.body ?? ""} onChange={(html) => set("body", html)} />
        <Input label="SEO Title" value={form.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)} />
        <Input label="SEO Description" value={form.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} />
        <Checkbox label="Published" checked={form.published ?? false} onChange={(e) => set("published", e.target.checked)} />
        <Button type="submit" loading={loading}>Create Post</Button>
      </form>
    </div>
  );
}
