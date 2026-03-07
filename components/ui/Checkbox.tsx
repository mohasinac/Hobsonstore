import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <label
        htmlFor={inputId}
        className="inline-flex items-center gap-2 cursor-pointer"
      >
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={cn(
            "h-4 w-4 accent-[#E8001C]",
            className,
          )}
          {...props}
        />
        <span className="text-sm font-medium" style={{ color: "#0D0D0D" }}>{label}</span>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";
