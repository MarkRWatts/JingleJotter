import { formatPence } from "@/lib/money";
import type { CategorySummary } from "@/lib/queries";

/** Per-category spend-vs-budget table for the season recap. */
export function CategoryTable({ categories }: { categories: CategorySummary[] }) {
  if (categories.length === 0) {
    return <p className="text-sm text-cocoa-soft">No categories set up this season.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm print:shadow-none print:border print:border-cocoa/15">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-cocoa/10 text-xs font-semibold uppercase tracking-wide text-cocoa-soft">
            <th className="py-2 pr-4 font-semibold">Category</th>
            <th className="py-2 pr-4 text-right font-semibold">Spent</th>
            <th className="py-2 pr-4 text-right font-semibold">Budget</th>
            <th className="py-2 text-right font-semibold">Over / under</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => {
            const diff = c.budgetPence - c.spentPence;
            const hasBudget = c.budgetPence > 0;
            const over = hasBudget && diff < 0;
            return (
              <tr key={c.id} className="border-b border-cocoa/10 last:border-0">
                <td className="py-2 pr-4 font-semibold text-cocoa">{c.name}</td>
                <td className="py-2 pr-4 text-right text-cocoa">{formatPence(c.spentPence)}</td>
                <td className="py-2 pr-4 text-right text-cocoa-soft">
                  {hasBudget ? formatPence(c.budgetPence) : "—"}
                </td>
                <td
                  className={`py-2 text-right font-semibold ${
                    !hasBudget ? "text-cocoa-soft" : over ? "text-berry-deep" : "text-pine"
                  }`}
                >
                  {hasBudget
                    ? `${over ? "-" : "+"}${formatPence(Math.abs(diff))}`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
