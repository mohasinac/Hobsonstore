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
          <tr key={key} className="border-b border-gray-100">
            <td className="w-1/3 py-1.5 pr-4 font-medium text-gray-600">
              {key}
            </td>
            <td className="py-1.5 text-gray-800">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
