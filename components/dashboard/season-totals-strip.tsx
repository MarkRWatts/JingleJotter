import { formatPence } from "@/lib/money";
import type { SeasonTotals } from "@/lib/queries";
import { ProgressBar } from "./progress-bar";

export function SeasonTotalsStrip({ totals }: { totals: SeasonTotals }) {
  const { totalSpentPence, totalBudgetPence, totalPlannedPence } = totals;
  const hasBudget = totalBudgetPence > 0;
  const percent = hasBudget ? (totalSpentPence / totalBudgetPence) * 100 : 0;
  const over = hasBudget && totalSpentPence > totalBudgetPence;

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-tag p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Spent so far" value={formatPence(totalSpentPence)} accent={over} />
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

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-cocoa-soft">{label}</span>
      <span className={`font-display text-xl ${accent ? "text-berry" : "text-pine-deep"}`}>{value}</span>
    </div>
  );
}
