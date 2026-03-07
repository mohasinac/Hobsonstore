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
          <tr key={key} style={{ borderBottom: "1px solid #E5E0C4" }}>
            <td className="w-1/3 py-1.5 pr-4 font-bold" style={{ color: "#6B6B6B" }}>
              {key}
            </td>
            <td className="py-1.5" style={{ color: "#0D0D0D" }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
