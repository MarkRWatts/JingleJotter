import { ArrowDown, ArrowUp } from "lucide-react";
import { formatPence } from "@/lib/money";
import type { SeasonTotals } from "@/lib/queries";
import { ProgressBar } from "./progress-bar";

export function SeasonTotalsStrip({
  totals,
  previousTotalSpentPence,
}: {
  totals: SeasonTotals;
  /** Previous season's actual spend, for the "vs last year" note; undefined = no predecessor. */
  previousTotalSpentPence?: number;
}) {
  const { totalSpentPence, totalBudgetPence, totalPlannedPence } = totals;
  const hasBudget = totalBudgetPence > 0;
  const percent = hasBudget ? (totalSpentPence / totalBudgetPence) * 100 : 0;
  const over = hasBudget && totalSpentPence > totalBudgetPence;

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-tag p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="Spent so far"
          value={formatPence(totalSpentPence)}
          accent={over}
          currentPence={totalSpentPence}
          previousPence={previousTotalSpentPence}
        />
        <Stat
          label="Season budget"
          value={hasBudget ? formatPence(totalBudgetPence) : "Not set"}
        />
        <Stat label="Incl. planned ideas" value={formatPence(totalPlannedPence)} />
      </div>
      {hasBudget && <ProgressBar percent={percent} over={over} track="white" />}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  currentPence,
  previousPence,
}: {
  label: string;
  value: string;
  accent?: boolean;
  /** This stat's raw pence value, only needed alongside previousPence for comparison. */
  currentPence?: number;
  /** Same figure from last season, for a quiet "vs £X last year" note. */
  previousPence?: number;
}) {
  const spendingMore = previousPence !== undefined && (currentPence ?? 0) > previousPence;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-cocoa-soft">{label}</span>
      <span className={`font-display text-xl ${accent ? "text-berry" : "text-pine-deep"}`}>{value}</span>
      {previousPence !== undefined && (
        <span className="flex items-center gap-1 text-xs text-cocoa-soft">
          {spendingMore ? (
            <ArrowUp className="h-3 w-3 text-berry" aria-hidden="true" />
          ) : (
            <ArrowDown className="h-3 w-3 text-pine" aria-hidden="true" />
          )}
          vs {formatPence(previousPence)} last year
        </span>
      )}
    </div>
  );
}
