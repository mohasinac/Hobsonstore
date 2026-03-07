import { cn } from "@/lib/cn";

interface RichTextRendererProps {
  html: string;
  className?: string;
}

/**
 * Renders sanitised HTML rich text.
 * Sanitisation is done server-side before storage; this component trusts the stored value.
 * Never pass raw user input directly — always sanitise with DOMPurify first.
 */
export function RichTextRenderer({ html, className }: RichTextRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none prose-a:text-red-600",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
