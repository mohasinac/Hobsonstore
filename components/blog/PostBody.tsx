"use client";

import { RichTextRenderer } from "@/components/ui/RichTextRenderer";

interface PostBodyProps {
  html: string;
}

export function PostBody({ html }: PostBodyProps) {
  return (
    <RichTextRenderer
      html={html}
      className="prose-lg prose-headings:font-bold prose-img:rounded-lg"
    />
  );
}
