interface ProductSpecsTableProps {
  specs: Record<string, string>;
}

export function ProductSpecsTable({ specs }: ProductSpecsTableProps) {
  const entries = Object.entries(specs);
  if (entries.length === 0) return null;

  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key} style={{ borderBottom: "1px solid var(--table-row-border)" }}>
            <td className="w-1/3 py-1.5 pr-4 font-bold" style={{ color: "var(--color-muted)" }}>
              {key}
            </td>
            <td className="py-1.5" style={{ color: "var(--color-black)" }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
