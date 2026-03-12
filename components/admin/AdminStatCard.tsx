interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: "default" | "green" | "red" | "amber";
}

const accentStyles = {
  default: "border-gray-200",
  green: "border-green-200 bg-green-50",
  red: "border-red-200 bg-red-50",
  amber: "border-amber-200 bg-amber-50",
};

const valueStyles = {
  default: "text-gray-900",
  green: "text-green-700",
  red: "text-red-700",
  amber: "text-amber-700",
};

export function AdminStatCard({ title, value, subtitle, accent = "default" }: AdminStatCardProps) {
  return (
    <div className={`rounded-lg border p-5 ${accentStyles[accent]}`} style={accent === "default" ? { background: "var(--surface-elevated)" } : undefined}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</p>
      <p className={`mt-1 text-3xl font-bold ${valueStyles[accent]}`}>{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
