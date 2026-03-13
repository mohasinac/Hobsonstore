import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold"
            style={{ color: "var(--color-black)", letterSpacing: "0.02em" }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(
            "px-3 py-2 text-sm outline-none transition-shadow resize-y",
            className,
          )}
          style={{
            border: error ? "2px solid var(--color-red)" : "2px solid var(--border-ink)",
            boxShadow: "3px 3px 0px var(--border-ink)",
            background: "var(--surface-elevated)",
            color: "var(--color-black)",
          }}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
