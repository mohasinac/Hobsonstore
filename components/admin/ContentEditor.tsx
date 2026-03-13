"use client";

/**
 * ContentEditor — simple HTML textarea editor.
 * Tiptap is not installed; this provides a functional editing surface.
 * Can be upgraded to Tiptap by swapping this component.
 */

interface ContentEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

export function ContentEditor({ label, value, onChange, minHeight = 300 }: ContentEditorProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium" style={{ color: 'var(--color-black)' }}>{label}</label>}
      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>HTML is accepted. Use standard tags: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;h2&gt;&ndash;&lt;h6&gt;, &lt;a href=&quot;&quot;&gt;.</p>
      <textarea
        className="w-full rounded-md border px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
        style={{ minHeight, borderColor: 'var(--border-ink)', background: 'var(--surface-elevated)', color: 'var(--color-black)' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
