import { formatPence } from "@/lib/money";
import type { PersonSummary } from "@/lib/queries";

/** Per-person gift spend-vs-allocation table for the season recap. Note:
 *  getPersonSummaries() already omits the viewer's own linked Person, so
 *  nothing here can reveal their own surprises. */
export function PersonTable({ people }: { people: PersonSummary[] }) {
  if (people.length === 0) {
    return <p className="text-sm text-cocoa-soft">No one with a gift budget or purchase yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm print:shadow-none print:border print:border-cocoa/15">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-cocoa/10 text-xs font-semibold uppercase tracking-wide text-cocoa-soft">
            <th className="py-2 pr-4 font-semibold">Person</th>
            <th className="py-2 pr-4 text-right font-semibold">Spent</th>
            <th className="py-2 text-right font-semibold">Allocation</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id} className="border-b border-cocoa/10 last:border-0">
              <td className="py-2 pr-4 font-semibold text-cocoa">{p.name}</td>
              <td className="py-2 pr-4 text-right text-cocoa">{formatPence(p.spentPence)}</td>
              <td className="py-2 text-right text-cocoa-soft">
                {p.allocatedPence > 0 ? formatPence(p.allocatedPence) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
