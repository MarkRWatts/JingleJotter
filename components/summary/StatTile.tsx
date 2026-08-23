/** One headline number in the summary's stat row. */
export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-white p-4 shadow-sm print:shadow-none print:border print:border-cocoa/15">
      <span className="text-xs font-semibold uppercase tracking-wide text-cocoa-soft">
        {label}
      </span>
      <span className="font-display text-xl text-pine-deep">{value}</span>
      {hint && <span className="text-xs text-cocoa-soft">{hint}</span>}
    </div>
  );
}
