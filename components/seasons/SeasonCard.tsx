import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { formatPence } from "@/lib/money";
import { SetActiveButton } from "./SetActiveButton";
import type { SeasonRowData } from "./types";

/** Mobile-first stacked card for one season — shown below md. */
export function SeasonCard({ season }: { season: SeasonRowData }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Link
          href={`/?year=${season.year}`}
          className="font-display text-xl text-pine-deep hover:underline"
        >
          Christmas {season.year}
        </Link>
        {season.active ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-tag px-2.5 py-0.5 text-xs font-semibold text-pine-deep">
            <CircleCheck size={12} />
            Active
          </span>
        ) : (
          <SetActiveButton seasonId={season.id} />
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-cocoa-soft">Purchases</dt>
          <dd className="font-semibold text-cocoa">{season.purchaseCount}</dd>
        </div>
        <div>
          <dt className="text-cocoa-soft">Actual spend</dt>
          <dd className="font-semibold text-cocoa">{formatPence(season.actualSpendPence)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-cocoa-soft">Total category budget</dt>
          <dd className="font-semibold text-cocoa">
            {formatPence(season.categoryBudgetPence)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
