import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/cn";

interface RichTextRendererProps {
  html: string;
  className?: string;
}

export function RichTextRenderer({ html, className }: RichTextRendererProps) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "h2", "h3", "h4", "a", "img", "blockquote", "pre", "code"],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel"],
    FORCE_BODY: true,
  });
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none prose-a:text-red-600",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
