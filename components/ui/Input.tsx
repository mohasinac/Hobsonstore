import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold"
            style={{ color: "#0D0D0D", letterSpacing: "0.02em" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "px-3 py-2 text-sm outline-none transition-shadow",
            className,
          )}
          style={{
            border: error ? "2px solid #E8001C" : "2px solid #0D0D0D",
            boxShadow: "3px 3px 0px #0D0D0D",
            background: "#FFFFFF",
            color: "#0D0D0D",
          }}
          {...props}
        />
        {error && <p className="text-xs font-bold" style={{ color: "#E8001C" }}>{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
