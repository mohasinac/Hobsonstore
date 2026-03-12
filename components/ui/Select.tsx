import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
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
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "px-3 py-2 text-sm outline-none transition-shadow",
            className,
          )}
          style={{
            border: error ? "2px solid var(--color-red)" : "2px solid var(--border-ink)",
            boxShadow: "3px 3px 0px var(--border-ink)",
            background: "var(--surface-elevated)",
            color: "var(--color-black)",
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs font-bold" style={{ color: "var(--color-red)" }}>{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";
