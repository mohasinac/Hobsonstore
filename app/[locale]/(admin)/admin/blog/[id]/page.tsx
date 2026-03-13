"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBlogPostById, updateBlogPost } from "@/lib/firebase/content";
import { revalidateContentCache } from "@/lib/actions/revalidate";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import type { BlogPost } from "@/types/content";

type BlogPostPayload = Omit<BlogPost, "id" | "publishedAt" | "updatedAt">;

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<Partial<BlogPostPayload>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pId, setPId] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setPId(id);
      getBlogPostById(id).then((p) => {
        setPost(p);
        if (p) setForm({
          title: p.title, slug: p.slug, coverImage: p.coverImage,
          body: p.body, excerpt: p.excerpt, tags: p.tags,
          authorName: p.authorName, authorAvatar: p.authorAvatar,
          published: p.published, seoTitle: p.seoTitle, seoDescription: p.seoDescription,
        });
        setLoading(false);
      });
    });
  }, [params]);

  function set<K extends keyof BlogPostPayload>(key: K, value: BlogPostPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateBlogPost(pId, form as Partial<Omit<BlogPost, "id">>);
      void revalidateContentCache();
      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>;
  if (!post) return <p className="text-sm text-red-600">Post not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Edit: {post.title}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} />
        <Input label="Slug" value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
        <Input label="Cover Image URL" value={form.coverImage ?? ""} onChange={(e) => set("coverImage", e.target.value)} />
        <Input label="Excerpt" value={form.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} />
        <Input label="Author Name" value={form.authorName ?? ""} onChange={(e) => set("authorName", e.target.value)} />
        <Input label="Tags (comma-separated)" value={(form.tags ?? []).join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
        <ContentEditor label="Body" value={form.body ?? ""} onChange={(html) => set("body", html)} />
        <Input label="SEO Title" value={form.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)} />
        <Input label="SEO Description" value={form.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} />
        <Checkbox label="Published" checked={form.published ?? false} onChange={(e) => set("published", e.target.checked)} />
        <Button type="submit" loading={saving}>Save Changes</Button>
      </form>
    </div>
  );
}
