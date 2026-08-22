import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { formatPence } from "@/lib/money";
import { SetActiveButton } from "./SetActiveButton";
import type { SeasonRowData } from "./types";

/** Desktop table row for one season — shown at md and up. */
export function SeasonTableRow({ season }: { season: SeasonRowData }) {
  return (
    <tr className="border-b border-cocoa/10 align-middle last:border-0">
      <td className="py-3 pr-4">
        <Link
          href={`/?year=${season.year}`}
          className="font-display text-lg text-pine-deep hover:underline"
        >
          Christmas {season.year}
        </Link>
      </td>
      <td className="py-3 pr-4">
        {season.active && (
          <span className="inline-flex items-center gap-1 rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-pine-deep">
            <CircleCheck size={12} />
            Active
          </span>
        )}
      </td>
      <td className="py-3 pr-4 text-right">{season.purchaseCount}</td>
      <td className="py-3 pr-4 text-right">{formatPence(season.actualSpendPence)}</td>
      <td className="py-3 pr-4 text-right">{formatPence(season.categoryBudgetPence)}</td>
      <td className="w-32 py-3 text-right">
        {!season.active && <SetActiveButton seasonId={season.id} />}
      </td>
    </tr>
  );
}
